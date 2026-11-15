import { useCallback, useEffect, useState } from 'react';
import axiosInstance from '../api/axios';

const groups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const inventoryOptions = ['Unavailable', 'Available', 'Low Stock', 'Critical'];
const sections = ['Overview', 'Donors', 'Requests', 'Reports', 'Accounts', 'Blood banks', 'Surveys', 'Audit log'];

export default function AdminView() {
  const [section, setSection] = useState('Overview');
  const [data, setData] = useState({ summary: {}, donors: [], requests: [], reports: [], users: [], banks: [], surveys: [], auditLogs: [] });
  const [bankForm, setBankForm] = useState({ name: '', address: '', phone: '', hours: '', facilityType: 'Blood centre', sourceUrl: '', licenseNumber: '' });
  const [bankInventory, setBankInventory] = useState({});
  const [bankLicenseNumbers, setBankLicenseNumbers] = useState({});
  const [donorVerificationNotes, setDonorVerificationNotes] = useState({});
  const [requestVerificationNotes, setRequestVerificationNotes] = useState({});
  const [bankVerificationNotes, setBankVerificationNotes] = useState({});
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAdminData = useCallback(async () => {
    const [summary, donors, requests, reports, users, banks, surveys, auditLogs] = await Promise.all([
      axiosInstance.get('/admin/summary'),
      axiosInstance.get('/admin/donors'),
      axiosInstance.get('/admin/requests'),
      axiosInstance.get('/admin/reports'),
      axiosInstance.get('/admin/users'),
      axiosInstance.get('/admin/blood-banks'),
      axiosInstance.get('/admin/surveys'),
      axiosInstance.get('/admin/audit-logs'),
    ]);
    return {
      summary: summary.data,
      donors: donors.data,
      requests: requests.data,
      reports: reports.data,
      users: users.data,
      banks: banks.data,
      surveys: surveys.data,
      auditLogs: auditLogs.data,
    };
  }, []);

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await fetchAdminData());
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load administrator data.');
    } finally {
      setLoading(false);
    }
  }, [fetchAdminData]);

  useEffect(() => {
    let active = true;
    fetchAdminData()
      .then((adminData) => { if (active) setData(adminData); })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || 'Could not load administrator data.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [fetchAdminData]);

  const runAction = async (action) => {
    setError('');
    try {
      await action();
      await loadAdminData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'The administrator action failed.');
    }
  };

  const saveBank = async (event) => {
    event.preventDefault();
    await runAction(async () => {
      await axiosInstance.post('/admin/blood-banks', bankForm);
      setBankForm({ name: '', address: '', phone: '', hours: '', facilityType: 'Blood centre', sourceUrl: '', licenseNumber: '' });
    });
  };

  const saveInventory = (bank) => runAction(() => axiosInstance.patch(`/admin/blood-banks/${bank._id}`, {
    inventory: bankInventory[bank._id] || Object.fromEntries(groups.map((group) => [group, bank.inventory?.[group] || 'Unavailable'])),
  }));

  const resolveReport = (report, status, suspendAccount = false) => runAction(() => axiosInstance.patch(`/admin/reports/${report._id}`, {
    status,
    suspendAccount,
    resolution: suspendAccount ? 'Account suspended after review' : '',
  }));

  const reviewBloodRequest = async (request, status) => {
    setError('');
    setNotice('');
    try {
      const { data: result } = await axiosInstance.patch(`/admin/requests/${request._id}/status`, {
        status,
        verificationNotes: requestVerificationNotes[request._id],
      });
      await loadAdminData();
      if (result.notificationWarning) {
        setNotice(result.notificationWarning);
      } else if (status === 'Searching') {
        setNotice(result.matchingDonors
          ? `Matching started. ${result.matchingDonors} compatible donor(s) were notified.`
          : 'Matching started, but no verified, available compatible donors were found.');
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not review this blood request.');
    }
  };

  const metricCards = Object.entries({
    'Pending donor verification': data.summary.pendingDonors,
    'Open reports': data.summary.openReports,
    'Banks awaiting verification': data.summary.pendingBanks,
    'Active requests': data.summary.activeRequests,
    'Survey responses': data.summary.surveyResponses,
    'Active accounts': data.summary.activeUsers,
  });

  return (
    <section className="admin-view">
      <header className="admin-view-header">
        <div>
          <h2 className="banks-heading">Administration &amp; Safety</h2>
          <p className="banks-subtext">Review blood requests, moderate accounts, verify directory listings and manage donor profile verification.</p>
        </div>
        <button className="btn-header-pill" onClick={loadAdminData} disabled={loading}>Refresh</button>
      </header>
      <nav className="admin-tabs" aria-label="Administration sections">
        {sections.map((item) => (
          <button key={item} className={section === item ? 'active' : ''} onClick={() => setSection(item)}>{item}</button>
        ))}
      </nav>
      {error && <div className="auth-error" role="alert">{error}</div>}
      {notice && <div className="availability-desc" role="status">{notice}</div>}
      {loading && <p className="loading-message">Loading administration data…</p>}

      {section === 'Overview' && (
        <div className="admin-metrics">
          {metricCards.map(([label, value]) => <article className="admin-card" key={label}><strong>{value ?? 0}</strong><span>{label}</span></article>)}
          <p className="availability-desc">Profile verification is an identity/profile review only; it is not medical clearance or donor eligibility certification.</p>
        </div>
      )}

      {section === 'Donors' && data.donors.map((donor) => (
        <article className="admin-card admin-row" key={donor._id}>
          <div><strong>{donor.name} · {donor.bloodGroup}</strong><span>{donor.area} · {donor.user?.email} · {donor.verificationStatus || 'Pending'}</span></div>
          <div className="admin-actions">
            {['Pending', 'Rejected'].map((status) => (
              <button key={status} onClick={() => runAction(() => axiosInstance.patch(`/admin/donors/${donor._id}/verification`, { verificationStatus: status }))}>{status}</button>
            ))}
              <input
                aria-label={`Verification notes for ${donor.name}`}
                placeholder="Record verification performed (10+ characters)"
                value={donorVerificationNotes[donor._id] || ''}
                onChange={(event) => setDonorVerificationNotes({ ...donorVerificationNotes, [donor._id]: event.target.value })}
              />
              <button onClick={() => runAction(() => axiosInstance.patch(`/admin/donors/${donor._id}/verification`, {
                verificationStatus: 'Verified',
                verificationNotes: donorVerificationNotes[donor._id],
              }))}>Verify profile</button>
          </div>
        </article>
      ))}

      {section === 'Requests' && (
        <div className="admin-request-list">
          {data.requests.map((request) => (
            <article className="admin-card admin-request-card" key={request._id}>
              <div>
                <strong>{request.bloodGroup} · {request.hospital} · {request.status}</strong>
                <span>{request.unitsNeeded} unit(s) · {request.urgency} · {request.area}{request.neededBy ? ` · Needed by ${new Date(request.neededBy).toLocaleString()}` : ''}</span>
                <span>Requester: {request.requesterName} · {request.requesterPhone} · {request.user?.email || request.requesterEmail}</span>
                {request.donorResponses?.length > 0 && (
                  <span>{request.donorResponses.length} donor response(s): {request.donorResponses.map((response) => `${response.donor?.name || 'Donor'} (${response.status})`).join(', ')}</span>
                )}
              </div>
              {request.status === 'Pending' && (
                <div className="admin-actions">
                  <label>
                    Verification notes
                    <input
                      minLength={10}
                      maxLength={1000}
                      placeholder="Record the request review (10+ characters)"
                      value={requestVerificationNotes[request._id] || ''}
                      onChange={(event) => setRequestVerificationNotes((current) => ({ ...current, [request._id]: event.target.value }))}
                    />
                  </label>
                  <button
                    disabled={(requestVerificationNotes[request._id] || '').trim().length < 10}
                    onClick={() => reviewBloodRequest(request, 'Verified')}
                  >Verify request</button>
                </div>
              )}
              {request.status === 'Verified' && (
                <button onClick={() => reviewBloodRequest(request, 'Searching')}>Start donor matching</button>
              )}
              {['Pending', 'Verified', 'Searching', 'Donor Responded', 'Connected'].includes(request.status) && (
                <button className="danger-action" onClick={() => reviewBloodRequest(request, 'Cancelled')}>Cancel request</button>
              )}
            </article>
          ))}
          {data.requests.length === 0 && <p className="availability-desc">No blood requests have been submitted.</p>}
        </div>
      )}

      {section === 'Reports' && data.reports.map((report) => (
        <article className="admin-card admin-row" key={report._id}>
          <div>
            <strong>{report.targetType} report · {report.reason} · {report.status}</strong>
            <span>Reported by {report.reporter?.name || 'Unknown'} · {report.details || 'No additional details'}</span>
            <span>{report.donor?.name || report.request?.hospital || 'Target unavailable'} · {new Date(report.createdAt).toLocaleString()}</span>
          </div>
          {report.status === 'Open' && (
            <div className="admin-actions">
              <button onClick={() => resolveReport(report, 'Resolved')}>Resolve</button>
              <button onClick={() => resolveReport(report, 'Dismissed')}>Dismiss</button>
              <button className="danger-action" onClick={() => {
                if (window.confirm('Suspend this target account and pause its donor profile or pending requests?')) {
                  resolveReport(report, 'Resolved', true);
                }
              }}>Suspend account</button>
            </div>
          )}
        </article>
      ))}

      {section === 'Accounts' && data.users.map((account) => (
        <article className="admin-card admin-row" key={account._id}>
          <div><strong>{account.name} · {account.role}</strong><span>{account.email} · {account.isActive === false ? 'Suspended' : 'Active'}</span></div>
          {account.role !== 'admin' && (
            <button onClick={() => runAction(() => axiosInstance.patch(`/admin/users/${account._id}/active`, { isActive: account.isActive === false }))}>
              {account.isActive === false ? 'Reactivate' : 'Suspend'}
            </button>
          )}
        </article>
      ))}

      {section === 'Blood banks' && (
        <>
          <form className="admin-card admin-bank-form" onSubmit={saveBank}>
            <h3>Add directory listing (starts unverified)</h3>
            <label>
              Facility type
              <select value={bankForm.facilityType} onChange={(event) => setBankForm({ ...bankForm, facilityType: event.target.value })}>
                <option value="Blood centre">Blood centre</option>
                <option value="Hospital">Hospital</option>
              </select>
            </label>
            {[
              ['name', 'Facility name'],
              ['address', 'Full address'],
              ['phone', 'Phone'],
              ['hours', 'Operating hours'],
              ['sourceUrl', 'Source URL'],
              ['licenseNumber', 'License number'],
            ].map(([field, label]) => (
              <label key={field}>{label}<input
                type={field === 'sourceUrl' ? 'url' : 'text'}
                required={field === 'sourceUrl'
                  ? bankForm.facilityType === 'Hospital'
                  : field === 'licenseNumber'
                    ? bankForm.facilityType !== 'Hospital'
                    : true}
                value={bankForm[field]}
                onChange={(event) => setBankForm({ ...bankForm, [field]: event.target.value })}
              /></label>
            ))}
            <label className="admin-checkbox-label">
              <input type="checkbox" checked={bankForm.isGovernment === true} onChange={(event) => setBankForm({ ...bankForm, isGovernment: event.target.checked })} />
              Government facility
            </label>
            <button type="submit">Add for verification</button>
          </form>
          {data.banks.map((bank) => (
            <article className="admin-card admin-bank-card" key={bank._id}>
              <strong>{bank.name} · {bank.facilityType || 'Blood centre'} · {bank.verificationStatus}</strong>
              <span>
                {bank.address} · {bank.phone} · {bank.hours}
                {bank.facilityType !== 'Hospital' && ` · License: ${bank.licenseNumber || 'not recorded'}`}
              </span>
              {bank.sourceUrl && <a href={bank.sourceUrl} target="_blank" rel="noopener noreferrer">Review submitted source</a>}
              {bank.facilityType !== 'Hospital' && <label className="admin-verification-note">
                License number
                <input
                  required
                  value={bankLicenseNumbers[bank._id] ?? bank.licenseNumber ?? ''}
                  onChange={(event) => setBankLicenseNumbers({ ...bankLicenseNumbers, [bank._id]: event.target.value })}
                />
              </label>}
              <div className="admin-actions">
                {['Pending', 'Rejected'].map((status) => (
                  <button key={status} onClick={() => runAction(() => axiosInstance.patch(`/admin/blood-banks/${bank._id}`, { verificationStatus: status }))}>{status}</button>
                ))}
              </div>
              <label className="admin-verification-note">
                Verification notes
                <input
                  placeholder={bank.facilityType === 'Hospital' ? 'Official hospital source checked (10+ characters)' : 'Source checked and license review (10+ characters)'}
                  minLength={10}
                  value={bankVerificationNotes[bank._id] || ''}
                  onChange={(event) => setBankVerificationNotes({ ...bankVerificationNotes, [bank._id]: event.target.value })}
                />
              </label>
              <button
                disabled={
                  (bankVerificationNotes[bank._id] || '').trim().length < 10
                  || (bank.facilityType === 'Hospital'
                    ? !bank.sourceUrl
                    : !(bankLicenseNumbers[bank._id] ?? bank.licenseNumber))
                }
                onClick={() => runAction(() => axiosInstance.patch(`/admin/blood-banks/${bank._id}`, {
                  verificationStatus: 'Verified',
                  ...(bank.facilityType !== 'Hospital' && { licenseNumber: bankLicenseNumbers[bank._id] ?? bank.licenseNumber }),
                  verificationNotes: bankVerificationNotes[bank._id],
                }))}
              >Verify and publish listing</button>
              {bank.facilityType !== 'Hospital' && (
                <>
                  <div className="admin-inventory-grid">
                    {groups.map((group) => (
                      <label key={group}>{group}
                        <select
                          value={bankInventory[bank._id]?.[group] || bank.inventory?.[group] || 'Unavailable'}
                          onChange={(event) => setBankInventory((current) => ({
                            ...current,
                            [bank._id]: { ...(current[bank._id] || Object.fromEntries(groups.map((item) => [item, bank.inventory?.[item] || 'Unavailable']))), [group]: event.target.value },
                          }))}
                        >
                          {inventoryOptions.map((option) => <option value={option} key={option}>{option}</option>)}
                        </select>
                      </label>
                    ))}
                  </div>
                  <button onClick={() => saveInventory(bank)}>Save stock update</button>
                </>
              )}
            </article>
          ))}
        </>
      )}

      {section === 'Surveys' && data.surveys.map((survey) => (
        <article className="admin-card admin-row" key={survey._id}>
          <div>
            <strong>{survey.name || 'Anonymous'} · {survey.bloodGroup} · {survey.area}</strong>
            <span>Availability: {survey.willingness} · Blood shortage experience: {survey.delayExperience}</span>
            <span>{survey.consentToContact ? `Follow-up consent granted · ${survey.phone}` : 'No follow-up consent; contact details not stored'}</span>
          </div>
        </article>
      ))}

      {section === 'Audit log' && (data.auditLogs || []).map((entry) => (
        <article className="admin-card admin-row" key={entry._id}>
          <div>
            <strong>{entry.action} · {entry.targetType} {entry.targetId}</strong>
            <span>{entry.actor?.name || 'Unknown admin'} · {new Date(entry.createdAt).toLocaleString()}</span>
            {entry.details && <span>{entry.details}</span>}
          </div>
        </article>
      ))}
    </section>
  );
}
