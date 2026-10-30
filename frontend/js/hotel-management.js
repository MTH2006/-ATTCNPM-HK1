(() => {
  const storageKey = 'hestora_managed_hotels_v1';
  const seed = [
    {id:'h1',name:'Grand Vista Hotel',address:'Quận 1, TP. Hồ Chí Minh',phone:'+84 28 3822 8899',email:'hello@grandvista.vn',description:'Khách sạn cao cấp giữa lòng Sài Gòn với tầm nhìn toàn cảnh sông Sài Gòn.',images:['assets/images/hotel_grand_vista.jpg'],amenities:['Wi-Fi','Bãi đỗ xe','Hồ bơi','Nhà hàng'],stars:5,verified:true,checkin:'14:00',checkout:'12:00',cancellation:'Hủy miễn phí trước 24 giờ.',stayPolicy:'Không hút thuốc trong phòng.',active:true},
    {id:'h2',name:'Sunrise Resort Phú Quốc',address:'Bãi Trường, Phú Quốc, Kiên Giang',phone:'+84 297 399 8888',email:'stay@sunrise.vn',description:'Resort nghỉ dưỡng bên bãi biển cát trắng Phú Quốc.',images:['assets/images/hotel_sunrise_resort.jpg'],amenities:['Wi-Fi','Hồ bơi','Nhà hàng'],stars:5,verified:true,checkin:'15:00',checkout:'12:00',cancellation:'Hủy miễn phí trước 48 giờ.',stayPolicy:'Trẻ em dưới 6 tuổi lưu trú miễn phí.',active:true},
    {id:'h3',name:'The Lumiere Hotel',address:'Đà Nẵng',phone:'+84 236 355 8866',email:'contact@lumiere.vn',description:'Khách sạn trung tâm với Sky Bar và hồ bơi tầng thượng.',images:['assets/images/hotel_the_lumiere.jpg'],amenities:['Wi-Fi','Bãi đỗ xe','Hồ bơi','Nhà hàng'],stars:4,verified:false,checkin:'14:00',checkout:'12:00',cancellation:'Không hoàn tiền khi hủy sát ngày.',stayPolicy:'Xuất trình giấy tờ tùy thân khi nhận phòng.',active:true},
    {id:'h4',name:'Melia Vinpearl Nha Trang',address:'Đảo Hòn Tre, Nha Trang, Khánh Hòa',phone:'+84 258 359 8900',email:'reservations@melia.vn',description:'Tổ hợp nghỉ dưỡng hướng biển với bãi biển riêng.',images:['assets/images/hotel_melia_nha_trang.jpg'],amenities:['Wi-Fi','Hồ bơi','Nhà hàng'],stars:5,verified:true,checkin:'15:00',checkout:'12:00',cancellation:'Theo điều kiện đặt phòng.',stayPolicy:'Không mang thú cưng.',active:false}
  ];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let hotels;
  let backendAvailable = false;
  try { hotels = JSON.parse(localStorage.getItem(storageKey)) || seed; } catch { hotels = seed; }
  const rows = document.getElementById('hotelRows'), dialog = document.getElementById('hotelDialog'), form = document.getElementById('hotelForm');
  const persist = () => localStorage.setItem(storageKey, JSON.stringify(hotels));
  const apiBase = 'http://localhost:8080/api/hotels';
  let signedInUser = null;
  try { signedInUser = JSON.parse(localStorage.getItem('hotel_user') || 'null'); } catch {}
  if (!signedInUser?.token || signedInUser.role !== 'ADMIN' || signedInUser.token.startsWith('mock_') || signedInUser.token.startsWith('jwt_mock_')) {
    document.querySelector('.main').innerHTML = '<section class="intro"><div><div class="eyebrow">TRUY CẬP BỊ TỪ CHỐI</div><h1>Cần quyền quản trị</h1><p>Đăng nhập bằng tài khoản có vai trò ADMIN để quản lý khách sạn.</p><a class="back-link" href="index.html">← Về trang chủ để đăng nhập</a></div></section>';
    return;
  }
  const fromApi = h => ({...h, address:h.address || h.location || '', images: (()=>{try{return h.images ? JSON.parse(h.images) : (h.image ? [h.image] : [])}catch{return h.image ? [h.image] : []}})(), amenities:(()=>{try{return h.amenities ? JSON.parse(h.amenities) : []}catch{return []}})(), stars:h.stars || 0, verified:!!h.verified, active:h.active !== false, cancellation:h.cancellationPolicy || ''});
  const toApi = h => ({name:h.name,location:h.address,city:h.address,price:0,description:h.description,image:h.images[0] || '',address:h.address,phone:h.phone,email:h.email,images:JSON.stringify(h.images),amenities:JSON.stringify(h.amenities),stars:h.stars,verified:h.verified,checkin:h.checkin,checkout:h.checkout,cancellationPolicy:h.cancellation,stayPolicy:h.stayPolicy,active:h.active});
  async function requestApi(path='', options={}) { const response=await fetch(`${apiBase}${path}`,{...options,headers:{'Content-Type':'application/json','Authorization':`Bearer ${signedInUser.token}`,...(options.headers||{})}});if(!response.ok)throw new Error(`API ${response.status}`);return response.status===204?null:response.json(); }
  async function loadFromBackend() { try { const data=await requestApi(); if(Array.isArray(data)){hotels=data.map(fromApi);backendAvailable=true;persist();render();document.getElementById('dataMode').textContent='Đã kết nối máy chủ · dữ liệu dùng chung';} } catch { backendAvailable=false;document.getElementById('dataMode').textContent='Không kết nối được máy chủ · thao tác bị khóa';document.querySelectorAll('#addHotel, #hotelRows button').forEach(button=>button.disabled=true); } }
  function render() {
    const query = document.getElementById('search').value.trim().toLocaleLowerCase('vi');
    const status = document.getElementById('statusFilter').value;
    const visible = hotels.filter(h => (status === 'all' || (status === 'active') === h.active) && `${h.name} ${h.address}`.toLocaleLowerCase('vi').includes(query));
    document.getElementById('totalCount').textContent = hotels.length;
    document.getElementById('activeCount').textContent = hotels.filter(h => h.active).length;
    document.getElementById('hiddenCount').textContent = hotels.filter(h => !h.active).length;
    document.getElementById('verifyCount').textContent = hotels.filter(h => !h.verified).length;
    document.getElementById('resultCount').textContent = `Hiển thị ${visible.length} / ${hotels.length} khách sạn`;
    document.getElementById('empty').hidden = visible.length > 0;
    rows.innerHTML = visible.map(h => `<tr>
      <td><div class="hotel-cell"><img class="hotel-thumb" src="${esc(h.images?.[0] || 'assets/images/hotel_grand_vista.jpg')}" alt="" onerror="this.src='assets/images/hotel_grand_vista.jpg'"><span><span class="hotel-name">${esc(h.name)}</span><span class="hotel-sub">${esc(h.email || 'Chưa có email')}</span></span></div></td>
      <td>${esc(h.address)}</td><td><span class="stars">${Number(h.stars)>0?'★'.repeat(Number(h.stars))+'☆'.repeat(5-Number(h.stars)):'—'}</span><span class="hotel-sub">${h.verified ? 'Đã xác minh' : 'Chờ xác minh'}</span></td>
      <td>${esc(h.phone || '—')}</td><td><span class="status ${h.active?'active':'hidden'}">${h.active?'Đang kinh doanh':'Đang ẩn'}</span></td>
      <td><div class="row-actions"><button data-action="edit" data-id="${esc(h.id)}">Chỉnh sửa</button><button data-action="toggle" data-id="${esc(h.id)}">${h.active?'Ẩn':'Hiển thị'}</button><button class="danger" data-action="delete" data-id="${esc(h.id)}" aria-label="Xóa ${esc(h.name)}">Xóa</button></div></td></tr>`).join('');
  }
  function notify(text) { const toast=document.getElementById('toast'); toast.textContent=text; toast.classList.add('show'); setTimeout(()=>toast.classList.remove('show'),2400); }
  function openForm(hotel) {
    form.reset(); form.elements.id.value = hotel?.id || '';
    document.getElementById('dialogTitle').textContent = hotel ? 'Cập nhật khách sạn' : 'Thêm khách sạn';
    const h = hotel || {stars:0,checkin:'14:00',checkout:'12:00',amenities:[],images:[]};
    for (const key of ['name','address','phone','email','description','stars','checkin','checkout','cancellation']) if (h[key] != null) form.elements[key].value=h[key];
    form.elements.images.value=(h.images||[]).join('\n'); form.elements.stayPolicy.value=h.stayPolicy||''; form.elements.verified.checked=!!h.verified;
    form.querySelectorAll('[name="amenity"]').forEach(c=>c.checked=(h.amenities||[]).includes(c.value));
    dialog.showModal();
  }
  document.getElementById('addHotel').addEventListener('click',()=>openForm());
  document.getElementById('closeDialog').addEventListener('click',()=>dialog.close());
  document.getElementById('cancelDialog').addEventListener('click',()=>dialog.close());
  document.getElementById('search').addEventListener('input',render); document.getElementById('statusFilter').addEventListener('change',render);
  rows.addEventListener('click',e=>{const button=e.target.closest('button[data-action]');if(!button)return;const h=hotels.find(item=>item.id===button.dataset.id);if(!h)return;
    if(button.dataset.action==='edit')openForm(h);
    if(button.dataset.action==='toggle'){(async()=>{const prior=h.active;h.active=!prior;try{if(backendAvailable)await requestApi(`/${h.id}`,{method:'PUT',body:JSON.stringify(toApi(h))});}catch{h.active=prior;notify('Không lưu được thay đổi lên máy chủ.');return;}persist();render();notify(h.active?'Khách sạn đã được hiển thị.':'Khách sạn đã được ẩn.');})();}
    if(button.dataset.action==='delete'&&confirm(`Xóa khách sạn “${h.name}” khỏi danh sách quản lý?`)){(async()=>{try{if(backendAvailable)await requestApi(`/${h.id}`,{method:'DELETE'});}catch{notify('Không xóa được khách sạn trên máy chủ.');return;}hotels=hotels.filter(item=>item.id!==h.id);persist();render();notify('Đã xóa khách sạn.');})();}
  });
  form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;(async()=>{const data=new FormData(form),id=data.get('id');const old=hotels.find(h=>String(h.id)===String(id));const hotel={id:id||`h${Date.now()}`,name:data.get('name').trim(),address:data.get('address').trim(),phone:data.get('phone').trim(),email:data.get('email').trim(),description:data.get('description').trim(),images:data.get('images').split('\n').map(v=>v.trim()).filter(Boolean),amenities:data.getAll('amenity'),stars:Number(data.get('stars')),verified:form.elements.verified.checked,checkin:data.get('checkin'),checkout:data.get('checkout'),cancellation:data.get('cancellation').trim(),stayPolicy:data.get('stayPolicy').trim(),active:old?old.active:true};if((!old&&hotel.stars>0&&!hotel.verified)||(old&&hotel.stars!==Number(old.stars||0)&&!hotel.verified)){notify('Cần xác minh hồ sơ trước khi gán hoặc đổi hạng sao.');return;}try{if(!backendAvailable)throw new Error('offline');const saved=await requestApi(old?`/${old.id}`:'',{method:old?'PUT':'POST',body:JSON.stringify(toApi(hotel))});if(!old)hotel.id=saved.id;}catch{notify('Không lưu được khách sạn lên máy chủ.');return;}if(old)hotels=hotels.map(h=>String(h.id)===String(id)?hotel:h);else hotels.unshift(hotel);persist();render();dialog.close();notify(old?'Đã cập nhật thông tin khách sạn.':'Đã thêm khách sạn mới.');})();});
  render();
  loadFromBackend();
})();
