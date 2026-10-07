import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import styled from "styled-components";
import toast from "react-hot-toast";
import { useUser } from "../features/authentication/useUser";
import { useApprovalRequests } from "../features/approvals/useApprovalRequests";
import { decideOperationsApproval, type ApprovalAction, type ApprovalRequest } from "../services/apiOperationsCopilot";

const Page = styled.section`display:grid;gap:2rem;min-width:0;`;
const Header = styled.header`display:flex;justify-content:space-between;align-items:flex-start;gap:1.2rem;flex-wrap:wrap;h1{font-size:2.8rem;}p{color:var(--color-grey-600);}`;
const Toolbar = styled.div`display:flex;align-items:center;gap:1.2rem;flex-wrap:wrap;select{padding:.8rem;border:1px solid var(--color-grey-300);border-radius:.5rem;background:var(--color-grey-0);}`;
const Button = styled.button`padding:.8rem 1.4rem;border:1px solid var(--color-grey-300);border-radius:.6rem;background:var(--color-grey-0);color:var(--color-grey-800);cursor:pointer;&:disabled{opacity:.55;cursor:not-allowed;} &:focus-visible{outline:2px solid var(--color-brand-600);outline-offset:2px;}`;
const Primary = styled(Button)`background:var(--color-brand-600);color:var(--color-brand-50);border-color:var(--color-brand-600);`;
const Card = styled.article`border:1px solid var(--color-grey-200);border-radius:.8rem;background:var(--color-grey-0);padding:2rem;display:grid;gap:1.2rem;min-width:0;header{display:flex;gap:1rem;flex-wrap:wrap;justify-content:space-between;}summary{cursor:pointer;color:var(--color-brand-600);}p{overflow-wrap:anywhere;}details>div{margin-top:1.2rem;}textarea{width:100%;padding:1rem;border:1px solid var(--color-grey-300);border-radius:.6rem;background:var(--color-grey-0);resize:vertical;color:inherit;} @media(max-width:40rem){padding:1.2rem;}`;
const Notes = styled.div`display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1.2rem;section{padding:1.2rem;border:1px solid var(--color-grey-200);border-radius:.6rem;}p{white-space:pre-wrap;margin-top:.8rem;}@media(max-width:50rem){grid-template-columns:1fr;}`;
const Actions = styled.div`display:flex;align-items:center;gap:1rem;flex-wrap:wrap;margin-top:1rem;`;
const Notice = styled.p`padding:1.2rem;border-radius:.6rem;background:var(--color-grey-100);`;
const Status = styled.span`font-weight:600;padding:.3rem .8rem;border:1px solid var(--color-grey-300);border-radius:2rem;font-size:1.3rem;`;
const labels: Record<string,string> = { draft:"Draft",pending:"Pending review",executed:"Approved and saved",rejected:"Rejected",cancelled:"Withdrawn",conflict:"Outdated request",approved:"Approved (legacy)" };
const eventLabels: Record<string,string> = { drafted:"Draft created",submitted:"Submitted for review",approved:"Approved",executed:"Internal note saved",rejected:"Rejected",cancelled:"Withdrawn",conflict:"Blocked because the existing note changed" };
function date(value:string|null) { if(!value)return "—";const parsed=new Date(value);return Number.isNaN(parsed.getTime())?"—":parsed.toLocaleString(); }

function RequestCard({ request, canReview }: { request:ApprovalRequest;canReview:boolean }) {
  const [reason,setReason]=useState(""); const [checked,setChecked]=useState(false); const [saving,setSaving]=useState<ApprovalAction|null>(null);
  const queryClient=useQueryClient();
  async function act(action:ApprovalAction) {
    if(saving)return; setSaving(action);
    try {
      const result=await decideOperationsApproval(request.id,action,reason);
      if(result.status==="conflict")toast.error("The existing note changed. This request was not executed. Create a new request.");
      else toast.success(action==="approve"?"Approved. Internal note saved.":action==="reject"?"Request rejected.":action==="submit"?"Submitted for administrator review.":action==="cancel"?"Request withdrawn.":"Result marked as read.");
      await Promise.all([
        queryClient.invalidateQueries({queryKey:["approvalRequests"]}),
        queryClient.invalidateQueries({queryKey:["booking",String(request.bookingId)]}),
        queryClient.invalidateQueries({queryKey:["bookings"]}),
      ]);
    } catch(error) { toast.error(error instanceof Error?error.message:"The request could not be processed."); }
    finally {setSaving(null);}
  }
  const unread=request.isOwn&&!request.seenAt&&["executed","rejected","conflict"].includes(request.status);
  return <Card aria-label={`Request for booking ${request.bookingId}`}>
    <header><h2><Link to={`/bookings/${request.bookingId}`}>Booking #{request.bookingId}</Link> · {request.cabinName}</h2><Status>{labels[request.status]}</Status></header>
    <p>{request.startDate} → {request.endDate} · {request.numGuests} guests</p>
    <p>Requested by {request.requesterName} · {date(request.submittedAt??request.createdAt)}</p>
    <p style={{whiteSpace:"pre-wrap"}}>{request.note}</p>
    {unread?<Notice role="status">New approval result. <Button disabled={Boolean(saving)} onClick={()=>void act("acknowledge")}>Mark as read</Button></Notice>:null}
    {request.reason?<Notice>Review reason: {request.reason}</Notice>:null}
    {request.decidedAt?<p>Reviewed by {request.reviewerName??"Legacy confirmation"} · {date(request.decidedAt)}{request.executedAt?` · Saved ${date(request.executedAt)}`:""}</p>:null}
    <details><summary>{canReview&&request.status==="pending"?"Review note and history":"View note and history"}</summary><div>
      <Notes><section><strong>Existing internal note</strong><p>{request.currentNote||"No internal note."}</p></section><section><strong>Proposed replacement</strong><p>{request.note}</p></section></Notes>
      {request.status==="pending"&&request.currentNote!==request.baseNote?<Notice role="alert">The internal note changed after this draft was created. Approval will be blocked to protect the newer note.</Notice>:null}
      <p>Request reference: <code>{request.id}</code></p>
      <ol aria-label="Request history">{request.events.map((event,index)=><li key={`${event.at}-${index}`}>{eventLabels[event.event]??event.event} · {date(event.at)}</li>)}</ol>
    </div></details>
    {canReview&&request.status==="pending"?<div>
      <label><input type="checkbox" checked={checked} disabled={Boolean(saving)} onChange={e=>setChecked(e.target.checked)}/> I reviewed the proposed note. Approval replaces the existing internal note.</label>
      <label htmlFor={`reason-${request.id}`}>Review comment (required when rejecting)</label>
      <textarea id={`reason-${request.id}`} rows={3} value={reason} disabled={Boolean(saving)} maxLength={500} onChange={e=>setReason(e.target.value)} />
      <Actions><Primary disabled={Boolean(saving)||!checked} onClick={()=>void act("approve")}>{saving==="approve"?"Processing…":request.currentNote!==request.baseNote?"Close outdated request":"Approve and save note"}</Primary>
      <Button disabled={Boolean(saving)||!reason.trim()} onClick={()=>void act("reject")}>{saving==="reject"?"Rejecting…":"Reject request"}</Button></Actions>
    </div>:null}
    {request.isOwn&&["draft","pending"].includes(request.status)?<Actions>
      {request.status==="draft"?<Primary disabled={Boolean(saving)} onClick={()=>void act("submit")}>{saving==="submit"?"Submitting…":"Submit for approval"}</Primary>:null}
      <Button disabled={Boolean(saving)} onClick={()=>void act("cancel")}>{saving==="cancel"?"Withdrawing…":"Withdraw request"}</Button>
    </Actions>:null}
    {request.status==="conflict"?<Notice>This request could not replace a newer note. Check the booking and create a new draft.</Notice>:null}
  </Card>;
}

export default function Approvals({mode="inbox"}:{mode?:"mine"|"inbox"}) {
  const {user,isLoading:loadingUser}=useUser();const isAdmin=user?.app_metadata?.role==="admin";
  const permitted=isAdmin||mode==="mine"&&user?.app_metadata?.role==="staff";
  const [status,setStatus]=useState(mode==="inbox"?"pending":"all");const [page,setPage]=useState(1);
  useEffect(()=>{setStatus(mode==="inbox"?"pending":"all");setPage(1);},[mode]);
  const query=useApprovalRequests(mode,status,page);
  if(loadingUser)return <p role="status">Loading account…</p>;
  if(!permitted)return <Page><h1>Access restricted</h1><p>Administrator access is required to review approval requests.</p><Link to="/my-requests">View my requests</Link></Page>;
  const data=query.data;
  return <Page aria-label={mode==="inbox"?"Approval center":"My approval requests"}>
    <Header><div><h1>{mode==="inbox"?"Approval center":"My requests"}</h1><p>{mode==="inbox"?"Review submitted internal notes before they are saved to bookings.":"Track drafts, administrator decisions and saved notes."}</p></div>
    {isAdmin?<Link to={mode==="inbox"?"/my-requests":"/approvals"}>{mode==="inbox"?"My requests":"Administrator inbox"}</Link>:null}</Header>
    {mode==="mine"&&Boolean(data?.unreadCount)?<Notice role="status">{data!.unreadCount} approval results await your review.</Notice>:null}
    <Toolbar><label htmlFor="approval-status">Status</label><select id="approval-status" value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}}>
      <option value="all">All requests</option>{mode==="mine"?<option value="draft">Drafts</option>:null}<option value="pending">Pending review</option><option value="history">History</option><option value="executed">Approved and saved</option><option value="rejected">Rejected</option><option value="cancelled">Withdrawn</option><option value="conflict">Outdated requests</option>
    </select><Button onClick={()=>void query.refetch()} disabled={query.isFetching}>Refresh</Button>{data?<span>{data.total} requests</span>:null}</Toolbar>
    {query.isLoading?<p role="status">Loading requests…</p>:query.isError?<Notice role="alert">{query.error instanceof Error?query.error.message:"Could not load requests."} <Button onClick={()=>void query.refetch()}>Try again</Button></Notice>:data?.items.length?data.items.map(request=><RequestCard key={request.id} request={request} canReview={mode==="inbox"&&isAdmin}/>):<Notice>No matching requests. Submitted requests and decisions are kept here after you refresh or sign in again.</Notice>}
    {data&&data.total>20?<Toolbar aria-label="Approval pagination"><Button disabled={page===1||query.isFetching} onClick={()=>setPage(p=>p-1)}>Previous</Button><span>Page {page} of {Math.ceil(data.total/20)}</span><Button disabled={page*20>=data.total||query.isFetching} onClick={()=>setPage(p=>p+1)}>Next</Button></Toolbar>:null}
  </Page>;
}
