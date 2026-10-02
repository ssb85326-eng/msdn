const DATA_STORAGE_KEY = 'winnew-images-v3';
const state = { images: [], filters: { system: '', version: '', language: '', edition: '', arch: '' } };
const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
const versionLabel = (item) => item.build ? item.version + '(' + item.build + ')' : item.version;
const languageNames = {'zh-cn':'简体中文','zh-tw':'繁体中文（台湾）','en-us':'英语（美国）','en-gb':'英语（英国）','ja-jp':'日语','ko-kr':'韩语','fr-fr':'法语（法国）','fr-ca':'法语（加拿大）','de-de':'德语','es-es':'西班牙语（西班牙）','es-mx':'西班牙语（墨西哥）','pt-br':'葡萄牙语（巴西）','pt-pt':'葡萄牙语（葡萄牙）','ru-ru':'俄语','it-it':'意大利语','nl-nl':'荷兰语','ar-sa':'阿拉伯语','tr-tr':'土耳其语','pl-pl':'波兰语','uk-ua':'乌克兰语','th-th':'泰语','sv-se':'瑞典语','da-dk':'丹麦语','nb-no':'挪威语','nn-no':'挪威语（尼诺斯克）','fi-fi':'芬兰语','cs-cz':'捷克语','sk-sk':'斯洛伐克语','hu-hu':'匈牙利语','ro-ro':'罗马尼亚语','el-gr':'希腊语','he-il':'希伯来语','hr-hr':'克罗地亚语','bg-bg':'保加利亚语','sr-latn-rs':'塞尔维亚语','sl-si':'斯洛文尼亚语','lt-lt':'立陶宛语','lv-lv':'拉脱维亚语','et-ee':'爱沙尼亚语'};
const languageCode = (item) => { const match = String(item.downloadUrl || '').match(/[_-]([a-z]{2,3}-[a-z]{2,4})(?:[._-]|$)/i); return match ? match[1].toLowerCase() : String(item.language || '').toLowerCase(); };
const languageAliases = {'arabic':'阿拉伯语','bulgarian':'保加利亚语','chinese simplified':'简体中文','chinese traditional tw':'繁体中文（台湾）','croatian':'克罗地亚语','czech':'捷克语','czech (czech republic)':'捷克语','danish':'丹麦语','dutch':'荷兰语','english':'英语（美国）','estonian':'爱沙尼亚语','finnish':'芬兰语','french':'法语（法国）','french - canada':'法语（加拿大）','german':'德语','greek':'希腊语','hebrew':'希伯来语','hungarian':'匈牙利语','italian':'意大利语','japanese':'日语','korean':'韩语','latvian':'拉脱维亚语','lithuanian':'立陶宛语','norwegian':'挪威语','norwegian bokmÃ¥l':'挪威语','norwegian bokmã¥l (norway)':'挪威语','polish':'波兰语','romanian':'罗马尼亚语','russian':'俄语','serbian latin':'塞尔维亚语','slovak':'斯洛伐克语','slovenian':'斯洛文尼亚语','spanish':'西班牙语（西班牙）','spanish - mexico':'西班牙语（墨西哥）','swedish':'瑞典语','thai':'泰语','turkish':'土耳其语','turkish (tÃ¼rkiye)':'土耳其语','ukrainian':'乌克兰语'};
const languageLabel = (itemOrValue) => { const code = typeof itemOrValue === 'object' ? languageCode(itemOrValue) : String(itemOrValue).toLowerCase(); return languageNames[code] || languageAliases[code] || ({'Chinese (China)':'简体中文','Chinese (Simplified, China)':'简体中文','Chinese (Traditional, Taiwan)':'繁体中文（台湾）','English (United States)':'英语（美国）','English (United Kingdom)':'英语（英国）'}[itemOrValue] || '其他语言'); };
const editionLabel = (value) => ({CoreCountrySpecific:'中国家庭版',consumer:'消费者版',enterprise:'企业版'}[value] || value);
const uniqueVersions = (system = '') => [...new Set(state.images.filter((item) => !system || item.system === system).map(versionLabel))].sort();
const formatDate = (value) => { const date = new Date(value); return Number.isNaN(date.getTime()) ? String(value) : date.toISOString().slice(0, 10); };
function showToast(message) { const toast = $('#toast'); toast.textContent = message; toast.classList.add('show'); window.setTimeout(() => toast.classList.remove('show'), 2200); }
function cardMarkup(item, featured) {
  const className = featured ? 'release-card featured' : 'release-card';
  return '<article class="' + className + '"><div class="query-row query-row-primary"><div class="release-card-top"><span class="system-badge">' + escapeHtml(item.system + ' ' + item.version) + '</span><a class="edition-link" href="#filters">' + escapeHtml(editionLabel(item.edition)) + ' ↗</a></div><div class="release-date">' + escapeHtml(formatDate(item.releaseDate)) + '</div><h3>' + escapeHtml(versionLabel(item)) + '</h3></div><div class="query-row query-row-secondary"><div class="release-meta"><span>内部版本 <b>' + escapeHtml(item.build || '-') + '</b></span><span>大小 <b>' + escapeHtml(item.size) + '</b></span><span>语言 <b>' + escapeHtml(languageLabel(item)) + '</b></span><span>架构 <b>' + escapeHtml(item.arch) + '</b></span></div><div class="hash"><small>' + escapeHtml(item.hashType) + '</small><code>' + escapeHtml(item.hash) + '</code></div><div class="card-actions"><a class="download-button" href="' + escapeHtml(item.downloadUrl) + '" target="_blank" rel="noreferrer">立即下载 ↗</a><button class="copy-button" data-url="' + escapeHtml(item.downloadUrl) + '" type="button">复制直链</button></div></div></article>';
}
function latestCardMarkup(item) {
  const title = item.system + ' ' + item.version + ' ' + editionLabel(item.edition);
  const editionHint = '版本包含：家庭版、专业版、企业版、教育版等全套版本';
  return '<article class="latest-mirror-card"><div class="latest-card-head"><h3 title="' + escapeHtml(editionHint) + '" aria-label="' + escapeHtml(title + '，' + editionHint) + '">' + escapeHtml(title) + '<span aria-hidden="true">ⓘ</span></h3><time>' + escapeHtml(formatDate(item.releaseDate)) + '</time></div><div class="latest-card-fields"><div><small>内部版本</small><b>' + escapeHtml(item.build || '-') + '</b></div><div><small>大小</small><b>' + escapeHtml(item.size) + '</b></div><div><small>语言</small><b>' + escapeHtml(languageLabel(item)) + '</b></div><div><small>架构</small><b>' + escapeHtml(item.arch) + '</b></div></div><div class="latest-hash"><span>' + escapeHtml(item.hashType) + ': </span><code>' + escapeHtml(item.hash) + '</code></div><div class="latest-actions"><a href="' + escapeHtml(item.downloadUrl) + '" target="_blank" rel="noreferrer">立即下载</a><button class="copy-button" data-url="' + escapeHtml(item.downloadUrl) + '" type="button">复制直链</button></div></article>';
}
function bindCopyButtons() { document.querySelectorAll('.copy-button').forEach((button) => button.addEventListener('click', async () => { try { await navigator.clipboard.writeText(button.dataset.url || ''); showToast('下载直链已复制'); } catch { showToast('复制失败，请手动复制'); } })); }
function compareLatestImages(a, b) {
  const dateComparison = new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
  if (dateComparison !== 0) return dateComparison;
  const versionNumber = (value) => Number(String(value || '').match(/(\d+)H\d+/i)?.[1] || 0);
  const versionComparison = versionNumber(b.version) - versionNumber(a.version);
  if (versionComparison !== 0) return versionComparison;
  return Number(String(b.build || '').replace(/[^\d.]/g, '')) - Number(String(a.build || '').replace(/[^\d.]/g, ''));
}
function render() {
  const requiredFiltersReady = state.filters.system && state.filters.version && state.filters.language && state.filters.edition;
  if (!requiredFiltersReady) {
    $('#result-count').textContent = '';
    $('#results').innerHTML = '';
    $('#empty-state').hidden = false;
    $('#empty-state').textContent = '请选择系统、版本号、语言和版本';
    return;
  }
  const filtered = state.images.filter((item) => Object.entries(state.filters).every(([key, value]) => !value || (key === 'version' ? versionLabel(item) === value : key === 'language' ? languageLabel(item) === value : item[key] === value)));
  $('#result-count').textContent = '共 ' + filtered.length + ' 条结果';
  $('#results').innerHTML = filtered.map((item) => cardMarkup(item, false)).join('');
  $('#empty-state').hidden = filtered.length > 0;
  $('#empty-state').textContent = '没有匹配的镜像，请调整筛选条件。';
  bindCopyButtons();
}
function setOptions(key, label) { const system = state.filters.system; const select = $('#' + key + '-filter'); const current = state.filters[key]; const items = state.images.filter((item) => !system || item.system === system); const values = key === 'version' ? uniqueVersions(system) : [...new Set(items.map((item) => key === 'language' ? languageLabel(item) : item[key]))].sort(); select.innerHTML = '<option value="">全部' + label + '</option>' + values.map((value) => '<option value="' + escapeHtml(value) + '">' + escapeHtml(key === 'edition' ? editionLabel(value) : value) + '</option>').join(''); if (values.includes(current)) select.value = current; else state.filters[key] = ''; }
function initFilters() {
  [['system','系统'],['version','版本号'],['language','语言'],['edition','版本'],['arch','架构']].forEach(([key, label]) => {
    const select = $('#' + key + '-filter');
    setOptions(key, label);
    select.addEventListener('change', () => {
      state.filters[key] = select.value;
      if (key === 'system') {
        state.filters.version = '';
        state.filters.language = '';
        state.filters.edition = '';
        state.filters.arch = '';
        setOptions('version', '版本号');
        $('#language-filter').innerHTML = '<option value="">请先选择版本号</option>';
        $('#edition-filter').innerHTML = '<option value="">请先选择语言</option>';
        $('#arch-filter').value = '';
      }
      if (key === 'version') {
        state.filters.language = '';
        state.filters.edition = '';
        const system = state.filters.system;
        const version = state.filters.version;
        const values = [...new Set(state.images.filter((item) => item.system === system && versionLabel(item) === version).map(languageLabel))].sort();
        $('#language-filter').innerHTML = '<option value="">请选择语言</option>' + values.map((value) => '<option value="' + escapeHtml(value) + '">' + escapeHtml(value) + '</option>').join('');
        $('#edition-filter').innerHTML = '<option value="">请先选择语言</option>';
      }
      if (key === 'language') {
        state.filters.edition = '';
        const values = [...new Set(state.images.filter((item) => item.system === state.filters.system && versionLabel(item) === state.filters.version && languageLabel(item) === state.filters.language).map((item) => item.edition))].sort();
        $('#edition-filter').innerHTML = '<option value="">请选择版本</option>' + values.map((value) => '<option value="' + escapeHtml(value) + '">' + escapeHtml(editionLabel(value)) + '</option>').join('');
      }
      render();
    });
  });
  $('#reset-filter').addEventListener('click', () => {
    Object.keys(state.filters).forEach((key) => { state.filters[key] = ''; $('#' + key + '-filter').value = ''; });
    setOptions('version', '版本号');
    $('#language-filter').innerHTML = '<option value="">请先选择版本号</option>';
    $('#edition-filter').innerHTML = '<option value="">请先选择语言</option>';
    render();
  });
}
async function init() { try { const stored = localStorage.getItem(DATA_STORAGE_KEY); state.images = stored ? JSON.parse(stored) : await (await fetch('data/images.json')).json(); initFilters(); const latest = ['Windows 11', 'Windows 10'].map((system) => state.images.filter((item) => item.system === system).sort(compareLatestImages)[0]).filter(Boolean); const latestGrid = $('#latest-grid'); if (latestGrid) { latestGrid.innerHTML = latest.map(latestCardMarkup).join(''); bindCopyButtons(); } render(); } catch { $('#results').innerHTML = '<div class="empty-state">数据加载失败，请通过本地服务器打开此网站。</div>'; } }
init();

