/* كيتشن فاست - تكلفة الأصناف (مرحلة 2): وصفة كل صنف + سعر البيع والربح. ملف مستقل. */
(function(){try{
if(window.__kfCosts)return;window.__kfCosts=1;
const UN={kg:'كيلو',l:'لتر',pcs:'قطعة'},SM={kg:[['كيلو',1],['جرام',.001]],l:[['لتر',1],['مل',.001]],pcs:[['قطعة',1]]};
const f2=x=>(Math.round((+x||0)*100)/100).toLocaleString('en-US');
const OPEN=new Set();let MS={};
const qd=(q,u)=>u=='kg'&&q<1?f2(q*1000)+' جرام':u=='l'&&q<1?f2(q*1000)+' مل':f2(q)+' '+(UN[u]||'');
const mc=i=>{const m=MS[i.material_id];return m?(+i.qty)*(+m.avg_cost)/(1-(+m.waste_pct)/100):0};
const ic=i=>i.kind=='fixed'?+i.amount:mc(i);

async function costs(){
 const[a,b,c]=await Promise.all([sb.from('products').select('id,name,price_per_kg,discount_percent').eq('is_active',true).order('sort_order'),sb.from('material_stock').select('id,name,unit,kind,avg_cost,waste_pct').eq('is_active',true).order('name'),sb.from('product_cost_items').select('*').order('created_at')]);
 const P=ok(a),M=ok(b),I=ok(c),by={};MS={};M.forEach(m=>MS[m.id]=m);
 I.forEach(i=>(by[i.product_id]=by[i.product_id]||[]).push(i));
 const mo=M.map(m=>`<option value="${m.id}" data-u="${m.unit}">${m.kind=='pack'?'📦':'🥩'} ${esc(m.name)}</option>`).join('');
 let nr=0,ls=0;
 const cards=P.map(p=>{const it=by[p.id]||[],sell=p.price_per_kg*(1-p.discount_percent/100),cost=it.reduce((s,i)=>s+ic(i),0),pr=sell-cost,mg=sell?pr/sell*100:0;
  if(!it.length)nr++;else if(pr<0)ls++;
  const rows=it.map(i=>{const m=MS[i.material_id]||{};
   return`<div class="r" data-id="${i.id}">${i.kind=='fixed'?`⚙️ ${esc(i.label)} — ${f2(i.amount)} ج`:`${m.kind=='pack'?'📦':'🥩'} ${esc(m.name)} — ${qd(+i.qty,m.unit)} — ${f2(mc(i))} ج${+m.avg_cost?'':' ⚠️ مفيش سعر شراء'}${+m.waste_pct?` <span class="m">(هالك ${+m.waste_pct}%)</span>`:''}`}<button class="b d" data-x="id">حذف</button></div>`}).join('');
  return`<details class="c" data-pid="${p.id}"${OPEN.has(p.id)?' open':''}><summary style="cursor:pointer"><b>${esc(p.name)}</b> <span class="m">بيع ${f2(sell)}${it.length?' · تكلفة '+f2(cost)+' · ':''}</span>${it.length?`<b style="color:${pr<0?'#ff6a6a':'var(--gold)'}">ربح ${f2(pr)} ج (${f2(mg)}%)</b>`:' <span class="m">— من غير وصفة</span>'}</summary>
<div style="margin-top:8px">${rows||'<p class="m">لسه مفيش مكونات لهذا الصنف.</p>'}
${it.length?`<div class="r"><b>التكلفة / كيلو: ${f2(cost)} ج</b><span>سعر البيع: ${f2(sell)} ج</span><b style="color:${pr<0?'#ff6a6a':'var(--gold)'}">الربح: ${f2(pr)} ج · ${f2(mg)}%</b></div>`:''}
<div style="margin-top:8px;display:grid;gap:8px"><label>إضافة مكوّن لكل 1 كيلو من الصنف<select data-f="sel"><option value="">اختار...</option>${mo}<option value="__fixed">⚙️ تكلفة ثابتة (عمالة / كهرباء...)</option></select></label>
<div class="g2 mt" hidden><label>الكمية<input data-f="qty" type="number" min="0" step="any"></label><label>الوحدة<select data-f="eu"></select></label></div>
<div class="g2 fx" hidden><label>الاسم<input data-f="label" list="fl"></label><label>المبلغ (ج)<input data-f="amt" type="number" min="0" step="any"></label></div>
<button class="b" data-x="ia">إضافة</button></div></div></details>`}).join('');
 V.innerHTML=`<datalist id="fl"><option value="عمالة"><option value="كهرباء"><option value="غاز"><option value="عمالة وكهرباء"></datalist>
<div class="c"><b class="g">تكلفة الأصناف</b><p class="m" style="margin:4px 0 0">${P.length} صنف · ${nr} من غير وصفة · ${ls} بخسارة. الكمية هي الصالحة للبيع، والهالك بيتحسب تلقائياً من نسبة هالك الخامة، وسعر الخامة هو متوسط أسعار شرائها.${M.length?'':' سجّل مشترياتك أول من تبويب المشتريات والمصروفات.'}</p></div>${cards}`}

async function addItem(c){const pid=c.dataset.pid,o=rd(c);
 if(o.sel=='__fixed'){const l=(o.label||'').trim();if(!l)return toast('اكتب اسم التكلفة',1);if(o.amt==null||o.amt<0)return toast('اكتب المبلغ',1);ok(await sb.from('product_cost_items').insert({product_id:pid,kind:'fixed',label:l,amount:o.amt}))}
 else if(o.sel){if(!(o.qty>0))return toast('اكتب الكمية',1);const f=+o.eu||1;ok(await sb.from('product_cost_items').insert({product_id:pid,kind:'material',material_id:o.sel,qty:Math.round(o.qty*f*1e6)/1e6}))}
 else return toast('اختار الخامة أو التكلفة',1);
 OPEN.add(pid);toast('تمت الإضافة');await costs()}

V.addEventListener('click',async e=>{const b=e.target.closest('[data-x]');if(!b)return;const x=b.dataset.x;
 try{
  if(x=='ia')await addItem(b.closest('[data-pid]'));
  else if(x=='id'){if(!confirm('حذف المكوّن؟'))return;const d=b.closest('[data-pid]');OPEN.add(d.dataset.pid);ok(await sb.from('product_cost_items').delete().eq('id',b.closest('[data-id]').dataset.id));toast('تم الحذف');await costs()}
 }catch(err){fail(err)}});
V.addEventListener('change',e=>{const el=e.target;if(el.dataset.f!='sel')return;const d=el.closest('[data-pid]'),mt=d.querySelector('.mt'),fx=d.querySelector('.fx'),eu=d.querySelector('[data-f=eu]');
 mt.hidden=!(el.value&&el.value!='__fixed');fx.hidden=el.value!='__fixed';
 if(!mt.hidden){const u=el.selectedOptions[0].dataset.u;eu.innerHTML=(SM[u]||[]).map(([l,f])=>`<option value="${f}">${l}</option>`).join('')}});
V.addEventListener('toggle',e=>{const d=e.target;if(d.dataset&&d.dataset.pid){d.open?OPEN.add(d.dataset.pid):OPEN.delete(d.dataset.pid)}},true);

window.costMap=async function(){try{const r=await sb.from('product_cost_calc').select('cost_per_kg,name');if(r.error)return{};const m={};r.data.forEach(x=>{if(+x.cost_per_kg>0)m[x.name]=+x.cost_per_kg});return m}catch(e){return{}}};
TABS.costs=['تكلفة الأصناف',costs];
$('nav').innerHTML=Object.entries(TABS).map(([k,v])=>`<button data-k="${k}">${v[0]}</button>`).join('');
}catch(e){console.error('admin-costs:',e)}})();
