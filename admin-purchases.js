/* كيتشن فاست - المشتريات والمصروفات والمخزون (مرحلة 1). ملف مستقل: لو فيه خطأ باقي اللوحة تكمل شغل. */
(function(){try{
const TD=()=>new Date().toLocaleDateString('en-CA',{timeZone:'Africa/Cairo'});
const UN={kg:'كيلو',l:'لتر',pcs:'قطعة'},PN={d:'اليوم',w:'الأسبوع',m:'الشهر',y:'السنة',a:'الكل'};
const EC=['كهرباء','إيجار','عمالة','غاز / وقود','مياه','صيانة','نقل','تسويق','أخرى'];
let PP='m',MD='p',MT=[];
const f2=x=>(Math.round((+x||0)*100)/100).toLocaleString('en-US');
const dn=d=>new Date(d+'T12:00:00Z').toLocaleDateString('ar-EG',{weekday:'long',timeZone:'UTC'});
function from(p){const t=TD(),[y,m,d]=t.split('-').map(Number);if(p=='d')return t;if(p=='m')return t.slice(0,8)+'01';if(p=='y')return y+'-01-01';if(p=='a')return'2000-01-01';const o=new Date(Date.UTC(y,m-1,d));o.setUTCDate(d-(o.getUTCDay()+1)%7);return o.toISOString().slice(0,10)}
const rq=(t,sel,c)=>{let r=sb.from(t).select(sel).gte(c,from(PP));if(PP=='d')r=r.lte(c,TD());return r.order(c,{ascending:false}).order('created_at',{ascending:false})};
document.head.insertAdjacentHTML('beforeend','<style>[hidden]{display:none!important}</style>');

async function buy(){
 const[m,p,x]=await Promise.all([sb.from('materials').select('id,name,unit').eq('is_active',true).order('name'),rq('purchases','id,purchase_date,quantity,total_price,notes,materials(name,unit)','purchase_date'),rq('expenses','id,expense_date,category,description,amount','expense_date')]);
 MT=ok(m);const P=ok(p),X=ok(x),D={};
 P.forEach(r=>(D[r.purchase_date]=D[r.purchase_date]||{p:[],x:[]}).p.push(r));
 X.forEach(r=>(D[r.expense_date]=D[r.expense_date]||{p:[],x:[]}).x.push(r));
 const sp=P.reduce((a,r)=>a+ +r.total_price,0),sx=X.reduce((a,r)=>a+ +r.amount,0);
 const days=Object.keys(D).sort().reverse().map(d=>{const g=D[d],t=g.p.reduce((a,r)=>a+ +r.total_price,0)+g.x.reduce((a,r)=>a+ +r.amount,0);
  return`<div class="c"><b class="g">${d} — ${dn(d)}</b> <span class="m">إجمالي اليوم: ${f2(t)} ج</span>`
  +g.p.map(r=>{const mt=r.materials||{};return`<div class="r" data-id="${r.id}">🛒 ${esc(mt.name)} — ${f2(r.quantity)} ${UN[mt.unit]||''} — ${f2(r.total_price)} ج <span class="m">(${f2(r.total_price/r.quantity)} ج للوحدة)${r.notes?' · '+esc(r.notes):''}</span><button class="b d" data-x="dp">حذف</button></div>`}).join('')
  +g.x.map(r=>`<div class="r" data-id="${r.id}">💸 ${esc(r.category)}${r.description?' — '+esc(r.description):''} — ${f2(r.amount)} ج<button class="b d" data-x="dx">حذف</button></div>`).join('')+'</div>'}).join('')||'<p class="m">لا توجد عمليات في الفترة دي.</p>';
 const mo=MT.map(r=>`<option value="${r.id}">${esc(r.name)} (${UN[r.unit]})</option>`).join('');
 const fp=`<div class="c" id="fp"${MD=='p'?'':' hidden'}><b>تسجيل شراء خامة</b><div class="g2"><label>الخامة<select data-f="material"><option value="">اختار...</option>${mo}<option value="__new">➕ خامة جديدة</option></select></label><label>التاريخ<input data-f="date" type="date" value="${TD()}"></label></div>
<div class="g2 nw" hidden><label>اسم الخامة<input data-f="name"></label><label>الوحدة<select data-f="unit"><option value="kg">كيلو</option><option value="l">لتر</option><option value="pcs">قطعة</option></select></label><label>النوع<select data-f="kind"><option value="raw">خامة</option><option value="pack">تغليف</option></select></label><label>نسبة الهالك %<input data-f="waste" type="number" min="0" max="99" value="0"></label></div>
<div class="g2"><label>الكمية<input data-f="qty" type="number" min="0" step="any"></label><label>الإجمالي المدفوع (ج)<input data-f="price" type="number" min="0" step="any"></label></div><p class="m" id="up"></p><label>ملاحظة<input data-f="note"></label><button class="b" data-x="sp">حفظ الشراء</button></div>`;
 const fx=`<div class="c" id="fx"${MD=='x'?'':' hidden'}><b>تسجيل مصروف</b><div class="g2"><label>النوع<select data-f="cat">${EC.map(c=>`<option>${c}</option>`).join('')}</select></label><label>التاريخ<input data-f="date" type="date" value="${TD()}"></label></div><div class="g2"><label>المبلغ (ج)<input data-f="amount" type="number" min="0" step="any"></label><label>تفاصيل<input data-f="desc"></label></div><button class="b" data-x="sx">حفظ المصروف</button></div>`;
 V.innerHTML=`<div class="c"><div class="r"><button class="pb${MD=='p'?' on':''}" data-x="md" data-k="p">🛒 شراء خامة</button><button class="pb${MD=='x'?' on':''}" data-x="md" data-k="x">💸 مصروف</button></div></div>${fp}${fx}
<div class="c"><div class="r">${Object.entries(PN).map(([k,v])=>`<button class="pb${PP==k?' on':''}" data-x="per" data-k="${k}">${v}</button>`).join('')}</div>
<p style="margin:8px 0 0"><b class="g">مشتريات الخامات: ${f2(sp)} ج</b> · <b>مصروفات: ${f2(sx)} ج</b> · <b>الإجمالي: ${f2(sp+sx)} ج</b></p></div>${days}`}

async function savePurchase(b){const o=rd(b);let id=o.material;
 if(id=='__new'){const nm=(o.name||'').trim();if(!nm)return toast('اكتب اسم الخامة',1);id=ok(await sb.from('materials').insert({name:nm,unit:o.unit,kind:o.kind,waste_pct:o.waste||0}).select('id').single()).id}
 if(!id)return toast('اختار الخامة',1);
 if(!(o.qty>0))return toast('اكتب الكمية',1);
 if(o.price==null||o.price<0)return toast('اكتب الإجمالي المدفوع',1);
 ok(await sb.from('purchases').insert({material_id:id,quantity:o.qty,total_price:o.price,purchase_date:o.date||TD(),notes:(o.note||'').trim()||null}));toast('تم تسجيل الشراء');await buy()}
async function saveExpense(b){const o=rd(b);
 if(!(o.amount>0))return toast('اكتب المبلغ',1);
 ok(await sb.from('expenses').insert({category:o.cat,description:(o.desc||'').trim()||null,amount:o.amount,expense_date:o.date||TD()}));toast('تم تسجيل المصروف');await buy()}

async function stock(){
 const r=ok(await sb.from('material_stock').select('*').eq('is_active',true).order('kind').order('name'));
 const tv=r.reduce((a,x)=>a+Math.max(0,+x.balance)*+x.avg_cost,0);
 V.innerHTML=`<div class="c"><b class="g">قيمة المخزون الحالي: ${f2(tv)} ج</b><p class="m" style="margin:4px 0 0">الرصيد = المشتريات − المستهلك (الخصم عند البيع والجرد في المراحل الجاية). متوسط السعر = إجمالي ما دفعته ÷ إجمالي الكمية المشتراة.</p></div>`
 +(r.length?r.map(x=>{const low=+x.min_stock>0&&+x.balance<=+x.min_stock;
  return`<div class="c" data-id="${x.id}"><b>${esc(x.name)}</b> <span class="m">${x.kind=='pack'?'تغليف':'خامة'} · ${UN[x.unit]}</span><div class="r"><span${low?' style="color:#ff6a6a"':''}>الرصيد: ${f2(x.balance)} ${UN[x.unit]}${low?' ⚠️ قارب على الخلاص':''}</span><span>متوسط السعر: ${f2(x.avg_cost)} ج</span><span>القيمة: ${f2(Math.max(0,+x.balance)*+x.avg_cost)} ج</span></div><div class="g2"><label>نسبة الهالك %<input data-f="waste" type="number" min="0" max="99" value="${+x.waste_pct}"></label><label>حد التنبيه (${UN[x.unit]})<input data-f="min" type="number" min="0" step="any" value="${+x.min_stock}"></label></div><button class="b" data-x="ms">حفظ</button></div>`}).join(''):'<p class="m">لسه مفيش خامات. سجّل أول عملية شراء من تبويب المشتريات والمصروفات.</p>')}

V.addEventListener('click',async e=>{const b=e.target.closest('[data-x]');if(!b)return;const x=b.dataset.x,c=b.closest('[data-id]');
 try{
  if(x=='per'){PP=b.dataset.k;await buy()}
  else if(x=='md'){MD=b.dataset.k;await buy()}
  else if(x=='sp')await savePurchase($('fp'))
  else if(x=='sx')await saveExpense($('fx'))
  else if(x=='dp'){if(!confirm('حذف عملية الشراء؟ هيتخصم من المخزون.'))return;ok(await sb.from('purchases').delete().eq('id',c.dataset.id));toast('تم الحذف');await buy()}
  else if(x=='dx'){if(!confirm('حذف المصروف؟'))return;ok(await sb.from('expenses').delete().eq('id',c.dataset.id));toast('تم الحذف');await buy()}
  else if(x=='ms'){const o=rd(c);ok(await sb.from('materials').update({waste_pct:o.waste||0,min_stock:o.min||0}).eq('id',c.dataset.id));toast('تم الحفظ');await stock()}
 }catch(err){fail(err)}});
V.addEventListener('change',e=>{if(e.target.dataset.f=='material'){const f=$('fp');if(f)f.querySelector('.nw').hidden=e.target.value!='__new'}});
V.addEventListener('input',e=>{const f=$('fp');if(!f||!f.contains(e.target))return;const o=rd(f);$('up').textContent=o.qty>0&&o.price!=null?'سعر الوحدة: '+f2(o.price/o.qty)+' ج':''});

TABS.buy=['المشتريات والمصروفات',buy];TABS.stock=['المخزون',stock];
$('nav').innerHTML=Object.entries(TABS).map(([k,v])=>`<button data-k="${k}">${v[0]}</button>`).join('');
}catch(e){console.error('admin-purchases:',e)}})();
