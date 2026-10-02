const STORAGE_KEY = 'winnew-images-v1';
const $ = (selector) => document.querySelector(selector);
let images = [];
const fields = ['system','version','releaseDate','edition','language','arch','size','hashType','hash','downloadUrl','source'];
function notify(message) { const toast = $('#admin-toast'); toast.textContent = message; toast.classList.add('show'); window.setTimeout(() => toast.classList.remove('show'), 2200); }
async function loadImages() { const stored = localStorage.getItem(STORAGE_KEY); if (stored) { try { images = JSON.parse(stored); return; } catch { localStorage.removeItem(STORAGE_KEY); } } try { const response = await fetch('data/images.json'); images = await response.json(); saveImages(); } catch { images = []; } }
function saveImages() { localStorage.setItem(STORAGE_KEY, JSON.stringify(images)); }
function makeId(item) { return [item.system,item.version,item.language,item.arch].join('-').toLowerCase().replace(/[^a-z0-9一-鿿]+/g, '-'); }
function readForm() { const item = {}; fields.forEach((field) => { item[field] = $('#' + field).value.trim(); }); item.id = $('#edit-id').value || makeId(item); return item; }
function renderList() { $('#admin-count').textContent = images.length + ' 条'; $('#admin-list').innerHTML = images.length ? images.map((item) => '<article class="admin-item"><div><strong>' + item.system + ' · ' + item.version + '</strong><small>' + item.edition + ' / ' + item.language + ' / ' + item.arch + '</small><small>' + item.source + '</small></div><div><button class="copy-button edit-item" data-id="' + item.id + '" type="button">编辑</button><button class="copy-button delete-item" data-id="' + item.id + '" type="button">删除</button></div></article>').join('') : '<div class="empty-state">还没有录入镜像数据。</div>'; document.querySelectorAll('.edit-item').forEach((button) => button.addEventListener('click', () => editItem(button.dataset.id))); document.querySelectorAll('.delete-item').forEach((button) => button.addEventListener('click', () => deleteItem(button.dataset.id))); }
function resetForm() { $('#image-form').reset(); $('#edit-id').value = ''; }
function editItem(id) { const item = images.find((entry) => entry.id === id); if (!item) return; $('#edit-id').value = item.id; fields.forEach((field) => { $('#' + field).value = item[field]; }); window.scrollTo({ top: 0, behavior: 'smooth' }); }
function deleteItem(id) { images = images.filter((item) => item.id !== id); saveImages(); renderList(); notify('数据已删除'); }
$('#image-form').addEventListener('submit', (event) => { event.preventDefault(); const item = readForm(); const index = images.findIndex((entry) => entry.id === item.id); if (index >= 0) images[index] = item; else images.unshift(item); saveImages(); renderList(); resetForm(); notify('数据已保存'); });
$('#clear-form').addEventListener('click', resetForm);
$('#export-button').addEventListener('click', () => { const blob = new Blob([JSON.stringify(images, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'winnew-images.json'; anchor.click(); URL.revokeObjectURL(url); notify('JSON 已导出'); });
$('#import-button').addEventListener('click', () => $('#file-input').click());
$('#file-input').addEventListener('change', async () => { const file = $('#file-input').files?.[0]; if (!file) return; try { const imported = JSON.parse(await file.text()); if (!Array.isArray(imported)) throw new Error('invalid'); images = imported; saveImages(); renderList(); notify('JSON 已导入'); } catch { notify('导入失败：JSON 格式不正确'); } $('#file-input').value = ''; });
loadImages().then(renderList);
