/* كيتشن فاست - تقرير المخزون (مرحلة 3): اللي اشتريته، واللي اتباع (اتخصم)، واللي موجود. ملف مستقل. */
(function(){try{
if(window.__kfStockRep)return;window.__kfStockRep=1;
const UN={kg:'كيلو',l:'لتر',pcs:'قطعة'},RS={purchase:'🛒 شراء',sale:'📤 بيع',stocktake:'📋 جرد',waste:'🗑️ هالك'};
const PN={d:'اليوم',w:'الأسبوع',m:'الشهر',y:'السنة',a:'الكل'};
let PP='m';
const TD=()=>new Date().toLocaleDateString('en-CA',{timeZone:'Africa/Cairo'});
const f2=x=>(Math.round((+x||0)*100)/100).toLocaleString('en-US');
const f3=x=>(Math.round((+x||0)*1000)/1000).toLocaleString('en-US');
function from(p){const t=TD(),[y,m,d]=t.split('-').map(Number);if(p=='d')return t;if(p=='m')return t.slice(0,8)+'01';if(p=='y')return y+'-01-01';if(p=='a')return'2000-01-01';const o=new Date(Date.UTC(y,m-1,d));o.setUTCDate(d-(o.getUTCDay()+1)%7);return o.toISOString().slice(0,10)}

async function rep(){
 const[a,b]=await Promise.all([sb.rpc('stock_report',{p_from:from(PP)}),sb.from('stock_movements').select('qty_change,reason,ref_id,created_at,materials(name,unit)').order('created_at',{ascending:false}).limit(60)]);
 const R=ok(a),L=ok(b);
 const ids=[...new Set(L.filter(x=>x.reason=='sale').map(x=>x.ref_id))];
 const ON={};if(ids.length)ok(await sb.from('orders').select('id,order_number').in('id',ids)).forEach(o=>ON[o.id]=o.order_number);
 const cs=R.reduce((s,x)=>s+(+x.sold)*(+x.avg_cost),0),sv=R.reduce((s,x)=>s+Math.max(0,+x.balance)*(+x.avg_cost),0);
 const rows=R.map(x=>{const u=UN[x.unit]||'',adj=+x.adjusted;
  return`<div class="c"><b>${esc(x.name)}</b> <span class="m">${x.kind=='pack'?'تغليف':'خامة'} · ${u}</span><div class="r"><span>اشتريت: ${f3(x.purchased)}</span><span>اتباع (اتخصم): ${f3(x.sold)}</span>${adj?`<span>جرد/هالك: ${adj>0?'+':''}${f3(adj)}</span>`:''}<b class="g">موجود: ${f3(x.balance)} ${u}</b></div><div class="m">تكلفة اللي اتباع: ${f2((+x.sold)*(+x.avg_cost))} ج · قيمة الموجود: ${f2(Math.max(0,+x.balance)*(+x.avg_cost))} ج</div></div>`}).join('')||'<p class="m">لسه مفيش خامات.</p>';
 const log=L.map(x=>{const m=x.materials||{},q=+x.qty_change,d=new Date(x.created_at).toLocaleString('ar-EG',{timeZone:'Africa/Cairo',dateStyle:'short',timeStyle:'short'});
  return`<div class="r"><span>${RS[x.reason]||x.reason}${x.reason=='sale'&&ON[x.ref_id]?' #'+esc(ON[x.ref_id]):''}</span><span>${esc(m.name)}</span><b style="color:${q<0?'#ff6a6a':'var(--gold)'}">${q>0?'+':''}${f3(q)} ${UN[m.unit]||''}</b><span class="m">${d}</span></div>`}).join('');
 V.innerHTML=`<div class="c"><div class="r">${Object.entries(PN).map(([k,v])=>`<button class="pb${PP==k?' on':''}" data-x="rp" data-k="${k}">${v}</button>`).join('')}</div>
<p style="margin:8px 0 0"><b class="g">تكلفة اللي اتباع في الفترة: ${f2(cs)} ج</b> · <b>قيمة المخزون الموجود: ${f2(sv)} ج</b></p>
<p class="m" style="margin:4px 0 0">الخصم بيتم تلقائياً لما الطلب يتحول لـ "تم التسليم" حسب وصفة كل صنف (وبيتلغي لو رجّعت حالة الطلب). الأصناف اللي من غير وصفة مبتخصمش حاجة.</p></div>${rows}
<div class="c"><b class="g">آخر حركات المخزون</b>${log||'<p class="m">لسه مفيش حركات.</p>'}</div>`}

V.addEventListener('click',async e=>{const b=e.target.closest('[data-x=rp]');if(!b)return;try{PP=b.dataset.k;await rep()}catch(err){fail(err)}});
TABS.sreport=['تقرير المخزون',rep];
$('nav').innerHTML=Object.entries(TABS).map(([k,v])=>`<button data-k="${k}">${v[0]}</button>`).join('');
}catch(e){console.error('admin-stockreport:',e)}})();
