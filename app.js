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
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const numberFrom=(text,pattern)=>{const match=String(text||'').match(pattern);return match?Number(match[1].replace(/,/g,'')):0;};
  const credits=n=>n>=1000000?(n/1000000).toFixed(n>=10000000?0:1)+'M':n>=1000?Math.round(n/1000)+'K':String(n||0);
  function row(item){return '<div class="feed-item"><strong>'+esc(item.title)+'</strong><span>'+esc(item.detail||'Core3 signal received')+'</span></div>';}
  async function refresh(){
    try{
      const response=await fetch(feedUrl+'?_='+Date.now(),{cache:'no-store'});if(!response.ok)throw new Error('HTTP '+response.status);
      const data=await response.json();const all=(data.items||[]).filter(i=>i.era==='Core3');
      const activity=all.filter(i=>['bounty_kill','heartbeat','csr','safety'].includes(i.kind)).slice(0,7);
      const hunters=all.filter(i=>['hunter_stat','ad','bounty_kill'].includes(i.kind)).slice(0,6);
      if(activityList)activityList.innerHTML=activity.length?activity.map(row).join(''):'<p class="empty">No new Core3 activity reported.</p>';
      if(hunterList)hunterList.innerHTML=hunters.length?hunters.map(row).join(''):'<p class="empty">No public contracts reported.</p>';
      const heartbeat=all.find(i=>i.kind==='heartbeat');const ad=all.find(i=>i.kind==='ad');
      const source=(heartbeat?.detail||'')+' '+(ad?.detail||'');const count=numberFrom(source,/(\d+)\s+(?:public\s+)?contracts?/i);const value=numberFrom(source,/([\d,]+)\s+credits/i);
      const countEl=document.getElementById('contract-count');const valueEl=document.getElementById('contract-value');
      if(countEl)countEl.textContent=String(count);if(valueEl)valueEl.textContent=credits(value);
      const state=document.getElementById('server-state');const dot=document.getElementById('status-dot');
      if(state)state.textContent='Online';if(dot)dot.className='status-dot online';
    }catch(error){
      if(activityList)activityList.innerHTML='<p class="empty">Core3 feed temporarily unavailable. Retrying shortly.</p>';
      if(hunterList)hunterList.innerHTML='<p class="empty">Bounty records unavailable.</p>';
      const state=document.getElementById('server-state');const dot=document.getElementById('status-dot');if(state)state.textContent='Feed offline';if(dot)dot.className='status-dot offline';
    }
  }
  refresh();setInterval(refresh,60000);
})();
