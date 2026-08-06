(function(){
  const menuButton=document.getElementById('menu-button');
  const nav=document.getElementById('site-nav');
  if(menuButton&&nav){menuButton.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));});}

  const disclaimer=document.getElementById('disclaimer');
  const check=document.getElementById('disclaimer-check');
  const accept=document.getElementById('disclaimer-accept');
  if(disclaimer&&localStorage.getItem('vlu_disclaimer_accepted')!=='1') disclaimer.classList.add('show');
  if(check&&accept){check.addEventListener('change',()=>accept.disabled=!check.checked);accept.addEventListener('click',()=>{localStorage.setItem('vlu_disclaimer_accepted','1');disclaimer.classList.remove('show');});}

  const activityList=document.getElementById('activity-list');
  const hunterList=document.getElementById('hunter-list');
  if(!activityList&&!hunterList) return;
  const feedUrl='https://register.swgtalon.online/activity.php';
  const statusUrl='https://register.swgtalon.online/status.precu.php';
  const resetBaseline=new Set([
    'bounty_kill|Xix Lightning was claimed on Dantooine|Unknown hunter claimed 612,000 credits near Dantooine outpost signal',
    'bounty_kill|Kiingpool was claimed on Corellia|Overt claimed 612,000 credits near Corellia starport trace',
    'hunter_stat|Overt active on the bounty net|1 kills, 612,000 credits earned, 1 active contracts',
    'heartbeat|Bounty net synced|Live board refreshed with 2 contracts, 2 marked online, and 0 claims today.',
    'csr|CSR support online|Need help in game? PM Xanatos, Equinox, or Mikato.',
    'safety|Play safe|Staff will never ask for your personal details or passwords.',
    'ad|Join the hunt|2 public contracts worth 1,224,000 credits are on the board.'
  ]);
  const signalKey=item=>[item.kind||'',item.title||'',item.detail||''].join('|');
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const numberFrom=(text,pattern)=>{const match=String(text||'').match(pattern);return match?Number(match[1].replace(/,/g,'')):0;};
  const credits=n=>n>=1000000?(n/1000000).toFixed(n>=10000000?0:1)+'M':n>=1000?Math.round(n/1000)+'K':String(n||0);
  function row(item){return '<div class="feed-item"><strong>'+esc(item.title)+'</strong><span>'+esc(item.detail||'Core3 signal received')+'</span></div>';}
  async function refresh(){
    try{
      const response=await fetch(feedUrl+'?_='+Date.now(),{cache:'no-store'});if(!response.ok)throw new Error('HTTP '+response.status);
      const data=await response.json();const all=(data.items||[]).filter(i=>i.era==='Core3'&&!resetBaseline.has(signalKey(i)));
      const activity=all.filter(i=>['bounty_kill','heartbeat','csr','safety'].includes(i.kind)).slice(0,7);
      const hunters=all.filter(i=>['hunter_stat','ad','bounty_kill'].includes(i.kind)).slice(0,6);
      if(activityList)activityList.innerHTML=activity.length?activity.map(row).join(''):'<p class="empty">No new Core3 activity reported.</p>';
      if(hunterList)hunterList.innerHTML=hunters.length?hunters.map(row).join(''):'<p class="empty">No public contracts reported.</p>';
      const heartbeat=all.find(i=>i.kind==='heartbeat');const ad=all.find(i=>i.kind==='ad');
      const source=(heartbeat?.detail||'')+' '+(ad?.detail||'');const count=numberFrom(source,/(\d+)\s+(?:public\s+)?contracts?/i);const value=numberFrom(source,/([\d,]+)\s+credits/i);
      const countEl=document.getElementById('contract-count');const valueEl=document.getElementById('contract-value');
      if(countEl)countEl.textContent=String(count);if(valueEl)valueEl.textContent=credits(value);
    }catch(error){
      if(activityList)activityList.innerHTML='<p class="empty">Core3 feed temporarily unavailable. Retrying shortly.</p>';
      if(hunterList)hunterList.innerHTML='<p class="empty">Bounty records unavailable.</p>';
    }
  }
  const duration=seconds=>{const total=Math.max(0,Number(seconds)||0);const days=Math.floor(total/86400);const hours=Math.floor((total%86400)/3600);return days?days+'d '+hours+'h':hours+'h '+Math.floor((total%3600)/60)+'m';};
  async function refreshStatus(){
    const indicator=document.getElementById('server-indicator');
    try{
      const response=await fetch(statusUrl+'?_='+Date.now(),{cache:'no-store'});if(!response.ok)throw new Error('HTTP '+response.status);
      const data=await response.json();const health=data.server_status||{};const playerData=data.players||{};const online=Number(playerData.online)||0;const isOnline=Boolean(health.overall_online);
      document.getElementById('server-state').textContent=isOnline?'Online':'Offline';indicator.className='server-indicator '+(isOnline?'online':'offline');
      document.getElementById('online-players').textContent=String(online);document.getElementById('population-fill').style.width=(isOnline?Math.max(3,Math.min(100,online*5)):3)+'%';
      document.getElementById('login-state').textContent=health.login_online?'Online':'Offline';document.getElementById('database-state').textContent=data.database?.ok?'Linked':'Fault';document.getElementById('game-uptime').textContent=duration(data.uptime?.game_uptime_seconds);
      const pilots=Array.isArray(playerData.online_now)?playerData.online_now:[];document.getElementById('active-pilots').textContent=pilots.length?pilots.map(p=>typeof p==='string'?p:(p.name||p.character||'Unknown')).join(' / '):'No transponder signals';
      const updated=new Date(data.updated_at);document.getElementById('ops-updated').textContent='Uplink synchronized '+(Number.isNaN(updated.getTime())?'just now':updated.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}));
    }catch(error){
      document.getElementById('server-state').textContent='Unreachable';indicator.className='server-indicator offline';document.getElementById('ops-updated').textContent='Telemetry link interrupted - retrying';
    }
  }
  refresh();refreshStatus();setInterval(refresh,60000);setInterval(refreshStatus,60000);
})();
