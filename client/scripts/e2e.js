const { io } = require('socket.io-client');

async function main(){
  const base = 'http://localhost:4000/api';
  function getToken(res){ const set = res.headers.get('set-cookie'); if(!set) return null; return set.split(';')[0]; }

  // register owner
  let res = await fetch(base + '/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'OwnerFile', email: 'ownerfile@test.local', password: 'password' }) });
  let ownerJson = await res.json(); let ownerCookie = getToken(res);
  if (!ownerJson || !ownerJson.user) {
    // registration failed (perhaps user exists) - try login
    console.log('Owner register failed, trying login', ownerJson);
    res = await fetch(base + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'ownerfile@test.local', password: 'password' }) });
    ownerJson = await res.json(); ownerCookie = getToken(res);
  }
  console.log('owner', ownerJson?.user?.id || ownerJson?.user?._id || ownerJson);

  // register freelancer
  res = await fetch(base + '/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'FreeFile', email: 'freefile@test.local', password: 'password' }) });
  let freeJson = await res.json(); let freeCookie = getToken(res);
  if (!freeJson || !freeJson.user) {
    console.log('Freelancer register failed, trying login', freeJson);
    res = await fetch(base + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'freefile@test.local', password: 'password' }) });
    freeJson = await res.json(); freeCookie = getToken(res);
  }
  console.log('freelancer', freeJson?.user?.id || freeJson?.user?._id || freeJson);

  await new Promise((resolve)=>{
    const s = io('http://localhost:4000', { query: { userId: freeJson.user.id }, transports: ['websocket'] });
    s.on('connect', ()=> console.log('socket connected'));
    s.on('hired', (p)=>{ console.log('SOCKET hired ->', p); s.disconnect(); resolve(); });
    setTimeout(()=>{ console.log('socket timeout'); s.disconnect(); resolve(); },15000);

    (async ()=>{
      const g = await fetch(base + '/gigs', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Cookie': ownerCookie }, body: JSON.stringify({ title: 'File E2E Gig', description: 'Test', budget: 300 }) });
      const gjson = await g.json(); console.log('gig', gjson.gig._id);
      const bid = await fetch(base + '/bids', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Cookie': freeCookie }, body: JSON.stringify({ gigId: gjson.gig._id, message: 'I will do it', price: 280 }) });
      const bidJson = await bid.json(); console.log('bid', bidJson.bid._id);
      setTimeout(async ()=>{ const hire = await fetch(base + '/bids/hire', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Cookie': ownerCookie }, body: JSON.stringify({ gigId: gjson.gig._id, bidId: bidJson.bid._id }) }); console.log('hire status', await hire.json()); }, 800);
    })();
  });

  console.log('E2E done');
}

main().catch(err=>{ console.error(err); process.exit(1); });
