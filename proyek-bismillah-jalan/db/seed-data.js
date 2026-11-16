// Data awal (seed) PASARIN: kategori, toko, produk, kurir, pembayaran, promo.
// Nama merek elektronik sengaja fiktif (Nova, Arka, Lumio, Vexa) agar tidak mengklaim spesifikasi merek asli.
// Semua isi hanya contoh untuk keperluan demo dan bisa diubah lewat aplikasi.

export const CATEGORIES = [
  { slug: 'fashion-pria', name: 'Fashion Pria', icon: '👔', color: '#E3ECFF', children: [
    ['sepatu-pria', 'Sepatu Pria', '👟'], ['baju-pria', 'Kaos & Kemeja', '👕'], ['celana-pria', 'Celana', '👖'], ['jaket-pria', 'Jaket & Hoodie', '🧥'] ] },
  { slug: 'fashion-wanita', name: 'Fashion Wanita', icon: '👗', color: '#FFE3EC', children: [
    ['sepatu-wanita', 'Sepatu Wanita', '👠'], ['dress-gamis', 'Dress & Gamis', '👗'], ['hijab', 'Hijab & Jilbab', '🧕'], ['atasan-wanita', 'Atasan & Blouse', '👚'] ] },
  { slug: 'tas-travel', name: 'Tas & Travel', icon: '🎒', color: '#E8E3FF', children: [
    ['ransel', 'Ransel & Tas Laptop', '🎒'], ['tas-wanita', 'Tas Tangan & Selempang', '👜'], ['koper', 'Koper & Travel', '🧳'], ['dompet', 'Dompet', '👛'] ] },
  { slug: 'hp-tablet', name: 'HP & Tablet', icon: '📱', color: '#DDF3FF', children: [
    ['smartphone', 'Smartphone', '📱'], ['tablet', 'Tablet', '📲'], ['aksesori-hp', 'Aksesori HP', '🔋'], ['smartwatch', 'Smartwatch', '⌚'] ] },
  { slug: 'komputer', name: 'Komputer & Laptop', icon: '💻', color: '#DDF6EA', children: [
    ['laptop', 'Laptop', '💻'], ['periferal', 'Mouse & Keyboard', '⌨️'], ['penyimpanan', 'Flashdisk & SSD', '💾'], ['monitor', 'Monitor', '🖥️'] ] },
  { slug: 'elektronik', name: 'Elektronik', icon: '🔌', color: '#FFF3D6', children: [
    ['audio', 'Audio & Headphone', '🎧'], ['kamera', 'Kamera', '📷'], ['tv-hiburan', 'TV & Hiburan', '📺'], ['elektronik-rumah', 'Elektronik Rumah', '🍚'] ] },
  { slug: 'rumah-tangga', name: 'Rumah Tangga', icon: '🏠', color: '#FFEBDD', children: [
    ['rak-penyimpanan', 'Rak & Penyimpanan', '🗄️'], ['furnitur', 'Furnitur', '🪑'], ['dapur', 'Peralatan Dapur', '🍳'], ['dekorasi', 'Dekorasi & Lampu', '🪴'], ['kebersihan', 'Kebersihan', '🧹'] ] },
  { slug: 'kecantikan', name: 'Kecantikan', icon: '💄', color: '#FFE0F0', children: [
    ['skincare', 'Perawatan Wajah', '🧴'], ['makeup', 'Makeup', '💋'], ['rambut-badan', 'Rambut & Badan', '🧼'], ['parfum', 'Parfum', '🌸'] ] },
  { slug: 'kesehatan', name: 'Kesehatan', icon: '💊', color: '#E1F6E3', children: [
    ['vitamin', 'Vitamin & Suplemen', '💊'], ['alkes', 'Alat Kesehatan', '🌡️'] ] },
  { slug: 'olahraga', name: 'Olahraga & Outdoor', icon: '⚽', color: '#DFF4D8', children: [
    ['sepatu-olahraga', 'Sepatu Olahraga', '🏃'], ['gym-fitness', 'Gym & Fitness', '🏋️'], ['outdoor', 'Camping & Outdoor', '⛺'], ['sepeda', 'Sepeda & Aksesori', '🚲'] ] },
  { slug: 'makanan', name: 'Makanan & Minuman', icon: '🍜', color: '#FFE9C7', children: [
    ['snack', 'Makanan Ringan', '🍿'], ['kopi-teh', 'Kopi & Teh', '☕'], ['bahan-masak', 'Bahan Masak', '🧂'], ['oleh-oleh', 'Oleh-oleh Khas', '🎁'] ] },
  { slug: 'ibu-bayi', name: 'Ibu & Bayi', icon: '🍼', color: '#FFEAF3', children: [
    ['perlengkapan-bayi', 'Perlengkapan Bayi', '🍼'], ['pakaian-bayi', 'Pakaian Bayi', '👶'] ] },
  { slug: 'mainan-hobi', name: 'Mainan & Hobi', icon: '🧸', color: '#FFF0C9', children: [
    ['mainan-anak', 'Mainan Anak', '🧸'], ['gaming', 'Gaming', '🎮'], ['alat-musik', 'Alat Musik', '🎸'], ['koleksi', 'Koleksi & Kreasi', '🧩'] ] },
  { slug: 'buku-alat-tulis', name: 'Buku & Alat Tulis', icon: '📚', color: '#E4E9FF', children: [
    ['buku', 'Buku', '📖'], ['alat-tulis', 'Alat Tulis', '✏️'], ['kuliah', 'Perlengkapan Kuliah', '🧮'] ] },
  { slug: 'otomotif', name: 'Otomotif', icon: '🏍️', color: '#E6E6EE', children: [
    ['helm', 'Helm & Jaket Riding', '🪖'], ['aksesori-motor', 'Aksesori Motor', '🛵'], ['oli-perawatan', 'Oli & Perawatan', '🛢️'], ['aksesori-mobil', 'Aksesori Mobil', '🚗'] ] },
  { slug: 'hewan', name: 'Perlengkapan Hewan', icon: '🐾', color: '#FFEFD6', children: [
    ['makanan-kucing', 'Makanan Kucing', '🐱'], ['makanan-anjing', 'Makanan Anjing', '🐶'], ['aksesori-hewan', 'Aksesori Hewan', '🦴'] ] },
  { slug: 'jam-aksesori', name: 'Jam & Aksesori', icon: '⌚', color: '#F0E6FF', children: [
    ['jam-tangan', 'Jam Tangan', '⌚'], ['perhiasan', 'Perhiasan', '💍'], ['kacamata', 'Kacamata', '🕶️'] ] },
];

// kode: [nama toko, kota, deskripsi]
export const STORES = {
  sn: ['Sepatu Nusantara', 'Surabaya', 'Sepatu lokal nyaman dan awet, dikirim langsung dari Surabaya.'],
  bk: ['Batik Kenanga Fashion', 'Yogyakarta', 'Busana harian pria dan wanita dengan bahan adem.'],
  jg: ['Jam & Gaya', 'Surabaya', 'Tas, dompet, jam, dan aksesori untuk gaya sehari-hari.'],
  ga: ['Gadget Arjuna', 'Jakarta Selatan', 'HP, tablet, dan aksesori. Garansi toko 7 hari.'],
  cp: ['Cipta Komputer', 'Jakarta Barat', 'Laptop, monitor, dan perlengkapan komputer.'],
  tm: ['Toko Elektro Maju', 'Surabaya', 'Elektronik rumah tangga dan hiburan.'],
  rr: ['Rumah Rapi', 'Bandung', 'Rak, furnitur, dan perlengkapan rumah supaya hunian lebih tertata.'],
  gc: ['Glow Corner', 'Bandung', 'Perawatan dan kecantikan untuk kulit tropis.'],
  sh: ['Sehat Selalu', 'Semarang', 'Vitamin dan alat kesehatan rumah.'],
  sp: ['Sporty ID', 'Bekasi', 'Perlengkapan olahraga dan kebugaran.'],
  or: ['Outdoor Rimba', 'Malang', 'Perlengkapan camping dan bersepeda.'],
  dn: ['Dapur Nusantara', 'Semarang', 'Bahan masak dan camilan khas daerah.'],
  kl: ['Kopi Lintang', 'Medan', 'Kopi dan teh pilihan dari petani lokal.'],
  sk: ['Si Kecil Baby Shop', 'Jakarta Timur', 'Perlengkapan bayi dan mainan anak.'],
  nm: ['Nada & Hobi', 'Yogyakarta', 'Alat musik, puzzle, dan perlengkapan hobi.'],
  bp: ['Buku Pelita', 'Yogyakarta', 'Buku, alat tulis, dan perlengkapan kuliah.'],
  mj: ['Motor Jaya Sparepart', 'Surabaya', 'Aksesori dan perawatan motor dan mobil.'],
  pf: ['Pawfect Pet Shop', 'Tangerang', 'Kebutuhan kucing, anjing, dan hewan kecil.'],
};

export const STORE_BY_CATEGORY = {
  'sepatu-pria': 'sn', 'sepatu-wanita': 'sn', 'sepatu-olahraga': 'sn',
  'baju-pria': 'bk', 'celana-pria': 'bk', 'jaket-pria': 'bk', 'dress-gamis': 'bk', 'hijab': 'bk', 'atasan-wanita': 'bk',
  'ransel': 'jg', 'tas-wanita': 'jg', 'koper': 'jg', 'dompet': 'jg', 'jam-tangan': 'jg', 'perhiasan': 'jg', 'kacamata': 'jg',
  'smartphone': 'ga', 'tablet': 'ga', 'aksesori-hp': 'ga', 'smartwatch': 'ga',
  'laptop': 'cp', 'periferal': 'cp', 'penyimpanan': 'cp', 'monitor': 'cp', 'gaming': 'cp',
  'audio': 'tm', 'kamera': 'tm', 'tv-hiburan': 'tm', 'elektronik-rumah': 'tm',
  'rak-penyimpanan': 'rr', 'furnitur': 'rr', 'dapur': 'rr', 'dekorasi': 'rr', 'kebersihan': 'rr',
  'skincare': 'gc', 'makeup': 'gc', 'rambut-badan': 'gc', 'parfum': 'gc',
  'vitamin': 'sh', 'alkes': 'sh',
  'gym-fitness': 'sp', 'outdoor': 'or', 'sepeda': 'or',
  'snack': 'dn', 'bahan-masak': 'dn', 'oleh-oleh': 'dn', 'kopi-teh': 'kl',
  'perlengkapan-bayi': 'sk', 'pakaian-bayi': 'sk', 'mainan-anak': 'sk',
  'alat-musik': 'nm', 'koleksi': 'nm',
  'buku': 'bp', 'alat-tulis': 'bp', 'kuliah': 'bp',
  'helm': 'mj', 'aksesori-motor': 'mj', 'oli-perawatan': 'mj', 'aksesori-mobil': 'mj',
  'makanan-kucing': 'pf', 'makanan-anjing': 'pf', 'aksesori-hewan': 'pf',
};

// Berat default (gram) per subkategori; selain itu 400 g
export const WEIGHT_BY_CATEGORY = {
  'sepatu-pria': 900, 'sepatu-wanita': 700, 'sepatu-olahraga': 800, 'jaket-pria': 600, 'celana-pria': 450,
  'ransel': 700, 'koper': 3200, 'smartphone': 450, 'tablet': 800, 'laptop': 2200, 'monitor': 4200,
  'tv-hiburan': 6000, 'elektronik-rumah': 2500, 'rak-penyimpanan': 4500, 'furnitur': 8000, 'dapur': 1500,
  'kebersihan': 1800, 'bahan-masak': 2000, 'gym-fitness': 2500, 'outdoor': 2200, 'perlengkapan-bayi': 800,
  'alat-musik': 2500, 'makanan-anjing': 2200, 'aksesori-hewan': 800, 'helm': 1300, 'aksesori-mobil': 1200,
};

const range = (list) => list.map((n) => [n, 0]);

export const VARIANT_PRESETS = {
  shoeM: ['Ukuran', range(['39', '40', '41', '42', '43', '44'])],
  shoeW: ['Ukuran', range(['36', '37', '38', '39', '40'])],
  cloth: ['Ukuran', range(['S', 'M', 'L', 'XL', 'XXL'])],
  clothW: ['Ukuran', range(['S', 'M', 'L', 'XL'])],
  pants: ['Ukuran', range(['28', '29', '30', '32', '34'])],
  kid: ['Usia', range(['0–3 bulan', '3–6 bulan', '6–12 bulan'])],
  helm: ['Ukuran', range(['M', 'L', 'XL'])],
  colorBW: ['Warna', range(['Hitam', 'Putih'])],
  colorBasic: ['Warna', range(['Hitam', 'Navy', 'Abu-abu', 'Cokelat'])],
  colorHijab: ['Warna', range(['Hitam', 'Krem', 'Dusty Pink', 'Sage'])],
  colorWood: ['Warna', range(['Natural', 'Walnut', 'Putih'])],
};

const P = (cat, name, price, emoji, extra, o = {}) => ({ cat, name, price, emoji, extra, ...o });

// v: nama preset atau [label, [[nama, tambahan harga], ...]]; b: merek; c: kondisi; w: berat; st: kode toko
export const PRODUCTS = [
  // Fashion pria
  P('sepatu-pria', 'Sepatu Sneakers Pria Casual Putih', 189000, '👟', 'Sol karet empuk, nyaman dipakai seharian', { v: 'shoeM', b: 'Nusantara Footwear' }),
  P('sepatu-pria', 'Sepatu Pantofel Pria Kulit Sintetis Formal', 275000, '👞', 'Cocok untuk kantor dan acara resmi', { v: 'shoeM', b: 'Nusantara Footwear' }),
  P('sepatu-pria', 'Sepatu Slip On Kanvas Pria', 129000, '👟', 'Praktis tanpa tali, bahan kanvas adem', { v: 'shoeM', b: 'Nusantara Footwear' }),
  P('sepatu-pria', 'Sandal Gunung Pria Anti Slip', 99000, '🩴', 'Tali adjustable dan sol anti selip', { v: 'shoeM' }),
  P('baju-pria', 'Kaos Polos Cotton Combed 30s', 55000, '👕', 'Katun combed 30s, lembut dan tidak panas', { v: 'cloth' }),
  P('baju-pria', 'Kemeja Flanel Kotak Lengan Panjang', 119000, '👔', 'Flanel tebal, nyaman untuk harian', { v: 'cloth' }),
  P('baju-pria', 'Polo Shirt Pria Katun Pique', 89000, '👕', 'Kerah rapi dan bahan pique berpori', { v: 'cloth' }),
  P('celana-pria', 'Celana Chino Slim Fit Pria', 149000, '👖', 'Potongan slim fit dengan bahan stretch', { v: 'pants' }),
  P('celana-pria', 'Celana Jeans Pria Regular Biru', 199000, '👖', 'Denim awet dengan jahitan kuat', { v: 'pants' }),
  P('celana-pria', 'Celana Jogger Training Pria', 99000, '👖', 'Karet pinggang dan saku resleting', { v: 'cloth' }),
  P('jaket-pria', 'Jaket Bomber Pria Waterproof', 229000, '🧥', 'Lapisan tahan air dengan saku dalam', { v: 'cloth' }),
  P('jaket-pria', 'Hoodie Zipper Fleece Pria', 159000, '🧥', 'Fleece tebal, hangat tanpa berat', { v: 'cloth' }),
  // Fashion wanita
  P('sepatu-wanita', 'Flat Shoes Wanita Anti Licin', 99000, '🥿', 'Insole empuk, ringan di kaki', { v: 'shoeW', b: 'Nusantara Footwear' }),
  P('sepatu-wanita', 'Sneakers Wanita Platform Putih', 219000, '👟', 'Sol platform 4 cm, mudah dipadukan', { v: 'shoeW', b: 'Nusantara Footwear' }),
  P('sepatu-wanita', 'Sepatu Heels Block 5 cm Wanita', 169000, '👠', 'Hak kokoh dan stabil', { v: 'shoeW', b: 'Nusantara Footwear' }),
  P('dress-gamis', 'Gamis Syari Polos Ceruty Babydoll', 235000, '👗', 'Jatuh dan tidak menerawang', { v: 'clothW' }),
  P('dress-gamis', 'Dress Midi Floral Wanita', 175000, '👗', 'Motif bunga dan bahan adem', { v: 'clothW' }),
  P('hijab', 'Hijab Segi Empat Voal Premium', 39000, '🧕', 'Voal ultrafine, mudah dibentuk', { v: 'colorHijab' }),
  P('hijab', 'Pashmina Instan Diamond', 49000, '🧕', 'Sudah berbentuk, tinggal pakai', { v: 'colorHijab' }),
  P('atasan-wanita', 'Blouse Katun Wanita Oversize', 85000, '👚', 'Potongan longgar dan nyaman', { v: 'clothW' }),
  P('atasan-wanita', 'Kaos Crop Top Wanita', 59000, '👚', 'Katun stretch, pas di badan', { v: 'clothW' }),
  // Tas & travel
  P('ransel', 'Ransel Laptop 15 Inch Anti Air', 189000, '🎒', 'Ada port USB dan slot laptop empuk', { v: 'colorBasic' }),
  P('ransel', 'Tas Punggung Sekolah Kanvas', 129000, '🎒', 'Banyak kantong, tali bahu empuk', { v: 'colorBasic' }),
  P('tas-wanita', 'Tas Selempang Wanita Mini Sling', 145000, '👜', 'Ringkas, muat HP dan dompet', { v: 'colorBasic' }),
  P('tas-wanita', 'Tote Bag Kanvas Resleting', 69000, '👜', 'Muat buku A4, kanvas tebal', { v: 'colorBasic' }),
  P('koper', 'Koper Kabin 20 Inch Polycarbonate', 459000, '🧳', 'Roda 360° dan kunci TSA', { v: 'colorBasic' }),
  P('koper', 'Travel Pouch Organizer Set 6 in 1', 59000, '🧳', 'Rapikan isi koper dengan mudah', { w: 400 }),
  P('dompet', 'Dompet Kulit Pria Lipat Tiga', 99000, '👛', 'Banyak slot kartu, kulit sintetis', { v: 'colorBasic' }),
  P('dompet', 'Dompet Wanita Panjang Resleting', 119000, '👛', 'Ruang luas untuk uang dan kartu', { v: 'colorBasic' }),
  // HP & tablet
  P('smartphone', 'Nova X5 5G 8GB RAM', 3199000, '📱', 'Layar AMOLED 120Hz, baterai 5000 mAh', { b: 'Nova', v: ['Penyimpanan', [['128GB', 0], ['256GB', 500000]]] }),
  P('smartphone', 'Arka A12 Lite 4GB RAM', 1399000, '📱', 'Hemat daya, cocok untuk harian', { b: 'Arka', v: ['Penyimpanan', [['64GB', 0], ['128GB', 250000]]] }),
  P('smartphone', 'Lumio S3 Pro 12GB RAM', 5499000, '📱', 'Kamera 108 MP dengan stabilizer optik', { b: 'Lumio', v: ['Penyimpanan', [['256GB', 0], ['512GB', 1000000]]] }),
  P('smartphone', 'Arka A12 Lite Bekas Mulus', 899000, '📱', 'Bekas terawat, semua fungsi normal', { b: 'Arka', c: 'bekas' }),
  P('tablet', 'Arka Pad 10 Inch 4/128GB', 1899000, '📲', 'Layar 10 inci dengan 4 speaker stereo', { b: 'Arka' }),
  P('tablet', 'Tablet Anak Edukasi 8 Inch', 799000, '📲', 'Ada mode anak dan kontrol orang tua', { b: 'Lumio' }),
  P('aksesori-hp', 'Powerbank 20000mAh Fast Charging', 189000, '🔋', 'Dua port output dan layar persentase', { b: 'Nova', w: 450 }),
  P('aksesori-hp', 'Charger GaN 33W + Kabel Type-C', 119000, '🔌', 'Kecil, dingin, dan cepat', { b: 'Nova', w: 250 }),
  P('aksesori-hp', 'Tempered Glass Anti Gores Full Cover', 25000, '📱', 'Anti sidik jari dan mudah dipasang', { w: 80 }),
  P('aksesori-hp', 'Soft Case HP Anti Crack', 35000, '📱', 'Bahan TPU dengan lubang presisi', { v: 'colorBasic', w: 100 }),
  P('smartwatch', 'Smartwatch Lumio Fit 2 AMOLED', 549000, '⌚', 'Pantau detak jantung dan tidur', { b: 'Lumio', v: 'colorBasic', w: 200 }),
  P('smartwatch', 'Smartband Arka Band 8', 249000, '⌚', 'Baterai tahan hingga 14 hari', { b: 'Arka', v: 'colorBasic', w: 150 }),
  // Komputer
  P('laptop', 'Laptop Vexa Slim 14" Ryzen 5 16/512GB', 7499000, '💻', 'Tipis 1,4 kg dengan layar IPS 14 inci', { b: 'Vexa' }),
  P('laptop', 'Laptop Pelajar Vexa Go 8/256GB', 3799000, '💻', 'Ringan untuk kuliah dan tugas', { b: 'Vexa' }),
  P('laptop', 'Laptop Gaming Vexa Titan RTX 4050', 14999000, '💻', 'Layar 144Hz dengan pendingin ganda', { b: 'Vexa', w: 2600 }),
  P('periferal', 'Mouse Wireless Silent Click', 69000, '🖱️', 'Klik senyap dan baterai awet', { v: 'colorBW', w: 150 }),
  P('periferal', 'Keyboard Mechanical TKL Hot-swap', 389000, '⌨️', 'Switch bisa diganti tanpa solder', { b: 'Ketik', w: 900 }),
  P('periferal', 'Webcam Full HD 1080p dengan Mic', 245000, '📷', 'Autofokus, cocok untuk kelas online', { w: 250 }),
  P('penyimpanan', 'Flashdisk 64GB USB 3.0', 79000, '💾', 'Transfer cepat dengan casing logam', { v: ['Kapasitas', [['32GB', -20000], ['64GB', 0], ['128GB', 60000]]], w: 50 }),
  P('penyimpanan', 'SSD NVMe 512GB Gen3', 589000, '💾', 'Boot laptop jadi lebih cepat', { w: 100 }),
  P('penyimpanan', 'Harddisk Eksternal 1TB', 749000, '💾', 'USB 3.0 dan tahan guncangan ringan', { w: 300 }),
  P('monitor', 'Monitor LED 24" IPS 75Hz', 1399000, '🖥️', 'Panel IPS dengan bezel tipis', { b: 'Vexa' }),
  P('monitor', 'Monitor Gaming 27" 165Hz Curved', 2699000, '🖥️', 'Respons 1 ms dan lengkung 1500R', { b: 'Vexa', w: 5200 }),
  // Elektronik
  P('audio', 'Earphone TWS Bluetooth 5.3 ENC', 159000, '🎧', 'Peredam bising saat telepon', { v: 'colorBW', w: 150 }),
  P('audio', 'Headphone Gaming Surround RGB', 269000, '🎧', 'Suara surround, mic bisa dilepas', { w: 450 }),
  P('audio', 'Speaker Bluetooth Portable Waterproof', 229000, '🔊', 'Tahan percikan air IPX6', { w: 700 }),
  P('kamera', 'Action Cam 4K Waterproof', 799000, '📷', 'Casing tahan air hingga 30 m', { w: 400 }),
  P('kamera', 'Kamera Mirrorless Kit 16–50mm', 8499000, '📷', 'Sensor APS-C 24 MP', { w: 1100 }),
  P('kamera', 'Tripod Fleksibel HP & Kamera', 49000, '📷', 'Kaki fleksibel, bisa dililit', { w: 250 }),
  P('tv-hiburan', 'Smart TV LED 43" Android Full HD', 3299000, '📺', 'Netflix dan YouTube bawaan', { w: 9000 }),
  P('tv-hiburan', 'TV Box Android 4K', 389000, '📺', 'Ubah TV biasa jadi smart TV', { w: 400 }),
  P('tv-hiburan', 'Proyektor Mini Portable 1080p', 1249000, '📽️', 'Ringkas, bisa tembak hingga 120 inci', { w: 1500 }),
  P('elektronik-rumah', 'Rice Cooker Digital 1,8 L', 449000, '🍚', 'Panel digital dan mode warm otomatis'),
  P('elektronik-rumah', 'Kipas Angin Berdiri 16" Remote', 329000, '🌀', '3 kecepatan, bisa berputar otomatis', { w: 4000 }),
  P('elektronik-rumah', 'Setrika Uap Listrik 1200W', 229000, '♨️', 'Sol keramik dengan uap kuat', { w: 1300 }),
  // Rumah tangga
  P('rak-penyimpanan', 'Rak Sepatu Susun Besi Anti Karat', 129000, '🗄️', 'Muat hingga 12 pasang sepatu', { v: ['Tingkat', [['3 Tingkat', 0], ['4 Tingkat', 40000], ['5 Tingkat', 80000]]] }),
  P('rak-penyimpanan', 'Rak Sepatu Lipat Tanpa Pasang', 99000, '🗄️', 'Langsung pakai dan bisa dilipat', { v: ['Tingkat', [['3 Tingkat', 0], ['4 Tingkat', 30000]]] }),
  P('rak-penyimpanan', 'Rak Buku Minimalis 5 Susun', 289000, '📚', 'Kayu MDF, kokoh dan ringan', { v: 'colorWood', w: 9000 }),
  P('rak-penyimpanan', 'Rak Dinding Floating Shelf Set 3', 89000, '🗄️', 'Isi 3 ukuran berbeda, mudah dipasang', { w: 2000 }),
  P('rak-penyimpanan', 'Lemari Plastik Susun Portabel', 349000, '🗄️', 'Anti rayap dan mudah dirakit', { w: 6000 }),
  P('rak-penyimpanan', 'Container Box Penyimpanan 50 L', 79000, '📦', 'Tutup rapat dan bisa ditumpuk', { w: 2500 }),
  P('furnitur', 'Meja Belajar Lipat Minimalis', 249000, '🪑', 'Hemat tempat karena bisa dilipat'),
  P('furnitur', 'Kursi Gaming Ergonomis', 1149000, '🪑', 'Sandaran bisa direbahkan hingga 155°', { w: 17000 }),
  P('furnitur', 'Meja Laptop Lipat Portable', 89000, '🪑', 'Tinggi bisa diatur, nyaman di kasur', { w: 1800 }),
  P('dapur', 'Wajan Anti Lengket 28 cm', 119000, '🍳', 'Lapisan granit anti lengket'),
  P('dapur', 'Set Pisau Dapur Stainless 5 Pcs', 135000, '🔪', 'Tajam dengan pegangan anti selip', { w: 900 }),
  P('dapur', 'Set Panci Stainless 3 Pcs', 299000, '🍲', 'Dasar tebal supaya panas merata', { w: 3000 }),
  P('dapur', 'Blender Kaca 1,5 L', 269000, '🥤', 'Pisau 4 mata, kuat untuk es batu', { w: 2800 }),
  P('dekorasi', 'Lampu Tidur LED Sentuh', 69000, '💡', '3 tingkat cahaya dan hemat energi', { w: 350 }),
  P('dekorasi', 'Pot Tanaman Keramik Set 3', 85000, '🪴', 'Tiga ukuran dengan alas piring', { w: 2500 }),
  P('dekorasi', 'Jam Dinding Kayu Minimalis', 99000, '🕰️', 'Mesin senyap, tidak berisik', { w: 800 }),
  P('kebersihan', 'Sapu Pel Lantai Putar 360°', 139000, '🧹', 'Ember dengan pemeras otomatis'),
  P('kebersihan', 'Vacuum Cleaner Handheld Wireless', 349000, '🧹', 'Hisapan kuat dan ringan dipegang', { w: 1200 }),
  P('kebersihan', 'Rak Jemuran Lipat Stainless', 189000, '🧺', 'Kuat menahan cucian basah', { w: 3500 }),
  // Kecantikan
  P('skincare', 'Sunscreen SPF 50 PA++++ 50 ml', 79000, '🧴', 'Tekstur ringan dan tidak lengket', { w: 120 }),
  P('skincare', 'Serum Niacinamide 10% 20 ml', 69000, '🧴', 'Membantu tampilan wajah lebih cerah', { w: 100 }),
  P('skincare', 'Pelembap Gel Ceramide 50 ml', 89000, '🧴', 'Tekstur gel yang mudah meresap', { w: 120 }),
  P('skincare', 'Facial Wash Gentle 100 ml', 39000, '🧼', 'Lembut untuk pemakaian harian', { w: 150 }),
  P('makeup', 'Lip Cream Matte Tahan Lama', 55000, '💄', 'Warna pekat dan tidak mudah luntur', { v: ['Warna', [['Nude', 0], ['Rose', 0], ['Coral', 0], ['Berry', 0]]], w: 60 }),
  P('makeup', 'Cushion Foundation SPF 35', 129000, '💄', 'Hasil natural dan ada refill', { v: ['Shade', [['Light', 0], ['Medium', 0], ['Tan', 0]]], w: 120 }),
  P('makeup', 'Maskara Waterproof Volume', 45000, '💄', 'Tahan air dan tidak menggumpal', { w: 50 }),
  P('rambut-badan', 'Shampoo Anti Ketombe 340 ml', 38000, '🧴', 'Segar dan lembut di kulit kepala', { w: 400 }),
  P('rambut-badan', 'Hair Dryer Ionic 1200W', 149000, '💨', 'Membantu mengurangi rambut kusut', { w: 600 }),
  P('rambut-badan', 'Body Lotion Shea Butter 400 ml', 49000, '🧴', 'Melembapkan seharian', { w: 450 }),
  P('parfum', 'Parfum Pria Woody 50 ml', 119000, '🌸', 'Aroma kayu hangat, tahan sekitar 6 jam', { w: 250 }),
  P('parfum', 'Body Mist Wanita Floral 100 ml', 45000, '🌸', 'Wangi bunga segar sepanjang hari', { w: 200 }),
  // Kesehatan
  P('vitamin', 'Vitamin C 1000 mg 30 Tablet', 59000, '💊', 'Membantu menjaga daya tahan tubuh', { w: 120 }),
  P('vitamin', 'Multivitamin Dewasa 60 Kapsul', 98000, '💊', 'Kombinasi vitamin dan mineral harian', { w: 150 }),
  P('vitamin', 'Madu Murni Hutan 650 ml', 85000, '🍯', 'Madu asli tanpa campuran gula', { w: 900 }),
  P('alkes', 'Masker Medis 3 Ply 50 Pcs', 29000, '😷', 'Pengait telinga lembut', { w: 250 }),
  P('alkes', 'Termometer Digital Infrared', 119000, '🌡️', 'Ukur suhu dalam 1 detik', { w: 200 }),
  P('alkes', 'Tensimeter Digital Lengan', 289000, '🩺', 'Layar besar dengan memori 60 data', { w: 700 }),
  // Olahraga
  P('sepatu-olahraga', 'Sepatu Lari Ringan Breathable', 249000, '🏃', 'Upper mesh dengan bobot ringan', { v: 'shoeM' }),
  P('sepatu-olahraga', 'Sepatu Futsal Anti Slip', 219000, '⚽', 'Sol karet gum dengan grip kuat', { v: 'shoeM' }),
  P('sepatu-olahraga', 'Sepatu Badminton Karet Gum', 275000, '🏸', 'Empuk di tumit, lincah bergerak', { v: 'shoeM' }),
  P('gym-fitness', 'Matras Yoga NBR 10 mm', 79000, '🧘', 'Tebal, tidak licin, dengan tali', { v: 'colorBasic', w: 1100 }),
  P('gym-fitness', 'Dumbbell Set Vinyl 10 kg', 229000, '🏋️', 'Lapisan vinyl dan mudah disimpan', { w: 10500 }),
  P('gym-fitness', 'Resistance Band Set 5 Level', 59000, '💪', 'Lima tingkat beban untuk semua level', { w: 500 }),
  P('outdoor', 'Tenda Camping 4 Orang Double Layer', 589000, '⛺', 'Tahan hujan dengan lapisan ganda'),
  P('outdoor', 'Sleeping Bag Polar Ultralight', 149000, '🛌', 'Ringkas dan hangat untuk camping', { w: 900 }),
  P('outdoor', 'Botol Minum Stainless 750 ml', 79000, '🥤', 'Menjaga suhu minuman', { w: 400 }),
  P('sepeda', 'Helm Sepeda Dewasa Ringan', 149000, '🚴', 'Banyak ventilasi dan ukuran adjustable', { w: 400 }),
  P('sepeda', 'Lampu Sepeda LED USB Depan Belakang', 65000, '🚲', 'Isi ulang USB dan tahan air', { w: 150 }),
  // Makanan & minuman
  P('snack', 'Keripik Singkong Balado 250 g', 22000, '🍿', 'Renyah, pedas, dan manis', { w: 300 }),
  P('snack', 'Makaroni Bantat Pedas 200 g', 18000, '🍿', 'Bumbu pedas daun jeruk', { w: 250 }),
  P('snack', 'Kacang Mete Panggang 250 g', 69000, '🥜', 'Gurih dan renyah', { w: 300 }),
  P('kopi-teh', 'Kopi Arabika Gayo 250 g', 85000, '☕', 'Aroma fruity dengan roasting medium', { v: ['Bentuk', [['Biji', 0], ['Bubuk', 0]]], w: 300 }),
  P('kopi-teh', 'Teh Hijau Melati 100 g', 28000, '🍵', 'Wangi melati alami', { w: 150 }),
  P('kopi-teh', 'Kopi Susu Sachet 20 Sachet', 39000, '☕', 'Praktis diseduh di mana saja', { w: 500 }),
  P('bahan-masak', 'Beras Premium 5 kg', 78000, '🍚', 'Pulen dan wangi', { w: 5000 }),
  P('bahan-masak', 'Minyak Goreng 2 L', 38000, '🧴', 'Jernih dan tidak cepat menghitam', { w: 2000 }),
  P('bahan-masak', 'Bumbu Rendang Instan Set 3', 32000, '🍛', 'Tinggal tumis dengan rasa autentik', { w: 300 }),
  P('bahan-masak', 'Sambal Bawang Botol 200 g', 28000, '🌶️', 'Pedas gurih, teman makan nasi', { w: 300 }),
  P('oleh-oleh', 'Bakpia Pathok Isi 25', 55000, '🥮', 'Isi kacang hijau yang lembut', { w: 700 }),
  P('oleh-oleh', 'Keripik Tempe Sagu Malang 200 g', 24000, '🍘', 'Tipis, renyah, khas Malang', { w: 250 }),
  P('oleh-oleh', 'Lapis Surabaya Premium', 99000, '🍰', 'Tiga lapis yang lembut dan legit', { w: 900 }),
  // Ibu & bayi
  P('perlengkapan-bayi', 'Botol Susu Bayi Anti Kolik 240 ml', 65000, '🍼', 'Dot silikon lembut, bebas BPA'),
  P('perlengkapan-bayi', 'Stroller Bayi Lipat Ringan', 899000, '👶', 'Lipat satu tangan dengan roda empuk', { w: 7500 }),
  P('perlengkapan-bayi', 'Popok Bayi Pants M 40 Pcs', 119000, '👶', 'Daya serap tinggi dan lembut', { w: 2200 }),
  P('pakaian-bayi', 'Jumper Bayi Katun Set 3 Pcs', 99000, '👶', 'Katun halus dengan kancing aman', { v: 'kid', w: 300 }),
  P('pakaian-bayi', 'Setelan Piyama Anak Lengan Panjang', 69000, '👶', 'Bahan adem untuk tidur nyenyak', { v: 'kid', w: 250 }),
  // Mainan & hobi
  P('mainan-anak', 'Balok Susun Edukasi 100 Pcs', 89000, '🧸', 'Melatih kreativitas dan motorik', { w: 1200 }),
  P('mainan-anak', 'Mobil RC Offroad 1:18', 179000, '🚙', 'Baterai isi ulang dan ban karet', { w: 700 }),
  P('mainan-anak', 'Boneka Beruang Jumbo 80 cm', 129000, '🧸', 'Bulu halus dan empuk dipeluk', { w: 1100 }),
  P('gaming', 'Controller Gamepad Wireless', 229000, '🎮', 'Bisa dipakai di HP dan PC', { w: 300 }),
  P('gaming', 'Mousepad Gaming XXL 90x40', 59000, '🎮', 'Alas karet anti slip', { w: 600 }),
  P('alat-musik', 'Gitar Akustik 38 Inch Pemula', 389000, '🎸', 'Termasuk senar cadangan dan pick'),
  P('alat-musik', 'Ukulele Concert 23 Inch', 249000, '🎸', 'Suara jernih, cocok untuk pemula', { w: 1200 }),
  P('alat-musik', 'Keyboard Piano 61 Tuts', 1049000, '🎹', 'Ada 100 suara dan ritme', { w: 4500 }),
  P('koleksi', 'Puzzle 1000 Pcs Pemandangan', 99000, '🧩', 'Gambar tajam dan potongan presisi', { w: 800 }),
  P('koleksi', 'Set Cat Air + Kuas Lukis', 75000, '🎨', '24 warna dan 3 kuas', { w: 500 }),
  // Buku & alat tulis
  P('buku', 'Buku Pemrograman Python untuk Pemula', 89000, '📖', 'Latihan bertahap dari dasar', { w: 500 }),
  P('buku', 'Novel Fantasi Petualangan Dunia Sihir', 79000, '📕', 'Petualangan seru penuh kejutan', { w: 400 }),
  P('buku', 'Buku Resep Masakan Nusantara', 110000, '📗', '100 resep lengkap dengan foto', { w: 700 }),
  P('alat-tulis', 'Pulpen Gel 0,5 mm Isi 12', 36000, '✏️', 'Tinta cepat kering', { w: 150 }),
  P('alat-tulis', 'Buku Catatan A5 Hardcover Dotted', 45000, '📓', 'Kertas 100 gsm yang tidak tembus', { w: 300 }),
  P('alat-tulis', 'Stabilo Highlighter Set 6 Warna', 29000, '🖍️', 'Warna pastel yang tidak menembus', { w: 150 }),
  P('kuliah', 'Kalkulator Ilmiah 240 Fungsi', 129000, '🧮', 'Cocok untuk ujian dan tugas', { w: 200 }),
  P('kuliah', 'Clipboard A4 dengan Penjepit', 25000, '📋', 'Bahan akrilik yang kuat', { w: 250 }),
  P('kuliah', 'Tas Laptop Sleeve 14 Inch', 89000, '💼', 'Empuk dan tahan benturan ringan', { w: 350 }),
  // Otomotif
  P('helm', 'Helm Full Face Double Visor', 389000, '🪖', 'Visor ganda anti silau', { v: 'helm' }),
  P('helm', 'Helm Half Face Retro', 249000, '🪖', 'Gaya klasik dengan tali yang aman', { v: 'helm' }),
  P('helm', 'Jaket Riding Motor Waterproof', 359000, '🧥', 'Pelindung siku dan punggung', { v: 'cloth', w: 1100 }),
  P('aksesori-motor', 'Holder HP Motor Anti Getar', 89000, '🛵', 'Cengkeraman kuat dan bisa diputar', { w: 300 }),
  P('aksesori-motor', 'Cover Motor Anti Air', 79000, '🛵', 'Lapisan tahan panas dan hujan', { w: 700 }),
  P('aksesori-motor', 'Spion Motor Universal Sepasang', 65000, '🛵', 'Cocok untuk banyak jenis motor', { w: 500 }),
  P('oli-perawatan', 'Oli Mesin Motor Matic 0,8 L', 52000, '🛢️', 'Menjaga performa mesin matic', { w: 900 }),
  P('oli-perawatan', 'Set Pembersih Rantai dan Pelumas', 59000, '🛢️', 'Berisi sikat dan pelumas', { w: 500 }),
  P('aksesori-mobil', 'Karpet Mobil Universal 5 Pcs', 199000, '🚗', 'Bahan karet anti air'),
  P('aksesori-mobil', 'Dashcam Full HD 1080p', 389000, '📹', 'Merekam otomatis saat mesin menyala', { w: 300 }),
  P('aksesori-mobil', 'Parfum Mobil Gantung', 25000, '🚗', 'Wangi segar tahan lama', { w: 60 }),
  // Hewan
  P('makanan-kucing', 'Makanan Kucing Dewasa 1 kg', 49000, '🐱', 'Rasa ikan laut dengan nutrisi seimbang', { w: 1000 }),
  P('makanan-kucing', 'Pasir Kucing Gumpal Wangi 10 L', 79000, '🐱', 'Menggumpal cepat dan mudah dibersihkan', { w: 9000 }),
  P('makanan-anjing', 'Makanan Anjing Dewasa 2 kg', 129000, '🐶', 'Protein tinggi dengan rasa ayam'),
  P('makanan-anjing', 'Snack Latihan Anjing Isi Ayam', 35000, '🐶', 'Pas untuk hadiah saat latihan', { w: 200 }),
  P('aksesori-hewan', 'Kandang Lipat Hewan Kecil', 289000, '🏠', 'Besi kokoh dan bisa dilipat', { w: 5500 }),
  P('aksesori-hewan', 'Mainan Kunyah Tali Anjing', 25000, '🦴', 'Membantu membersihkan gigi', { w: 150 }),
  P('aksesori-hewan', 'Tempat Minum Otomatis Hewan', 99000, '🥣', 'Kapasitas 2 liter'),
  // Jam & aksesori
  P('jam-tangan', 'Jam Tangan Pria Analog Kulit', 189000, '⌚', 'Tali kulit dan tahan percikan air', { v: 'colorBasic', w: 200 }),
  P('jam-tangan', 'Jam Tangan Wanita Rose Gold', 159000, '⌚', 'Tampilan elegan dengan ukuran mungil', { w: 150 }),
  P('perhiasan', 'Kalung Titanium Anti Karat', 75000, '📿', 'Tidak mudah menghitam', { w: 60 }),
  P('perhiasan', 'Cincin Perak 925 Polos', 149000, '💍', 'Desain sederhana, cocok untuk couple', { v: ['Ukuran', [['11', 0], ['12', 0], ['13', 0], ['14', 0]]], w: 30 }),
  P('perhiasan', 'Gelang Rantai Stainless', 59000, '📿', 'Pengait kuat dan aman dipakai harian', { w: 80 }),
  P('kacamata', 'Kacamata Anti Radiasi Blue Light', 89000, '👓', 'Mengurangi silau layar', { w: 120 }),
  P('kacamata', 'Kacamata Hitam Polarized Pria', 119000, '🕶️', 'Lensa polarized dengan UV400', { w: 150 }),
  // Produk toko demo (milik akun demo; bisa diubah dan dihapus untuk mencoba CRUD)
  P('baju-pria', 'Kaos Sablon Custom Polos', 75000, '👕', 'Bisa request desain sendiri', { v: 'cloth', st: 'demo', b: 'Toko Demo' }),
  P('koleksi', 'Stiker Laptop Vinyl Set 20 Pcs', 25000, '🧩', 'Tahan air dan tidak meninggalkan bekas', { st: 'demo', b: 'Toko Demo', w: 100 }),
  P('tas-wanita', 'Tote Bag Kanvas Custom', 49000, '👜', 'Sablon nama atau logo sesuai pesanan', { st: 'demo', b: 'Toko Demo', w: 250 }),
  P('koleksi', 'Gantungan Kunci Akrilik Custom', 15000, '🧩', 'Cetak dua sisi, minimal 5 pcs', { st: 'demo', b: 'Toko Demo', w: 50 }),
];

export const COURIERS = [
  ['JNE', 'Reguler', 10000, 4000, 2, 4],
  ['JNE', 'YES (Next Day)', 22000, 8000, 1, 1],
  ['J&T Express', 'Reguler', 9000, 4000, 2, 5],
  ['SiCepat', 'REG', 9500, 4000, 2, 3],
  ['SiCepat', 'BEST (Besok Sampai)', 17000, 6000, 1, 2],
  ['AnterAja', 'Reguler', 8500, 3500, 3, 5],
];

// [tipe, nama, biaya, catatan]
export const PAYMENT_METHODS = [
  ['transfer', 'Transfer Bank BCA', 0, 'Transfer ke rekening PASARIN lalu konfirmasi pembayaran'],
  ['transfer', 'Virtual Account BNI', 1000, 'Nomor VA dibuat setelah pesanan dibuat'],
  ['transfer', 'Virtual Account Mandiri', 1000, 'Nomor VA dibuat setelah pesanan dibuat'],
  ['transfer', 'Transfer Bank BRI', 0, 'Transfer ke rekening PASARIN lalu konfirmasi pembayaran'],
  ['ewallet', 'GoPay', 0, 'Bayar lewat aplikasi GoPay'],
  ['ewallet', 'OVO', 0, 'Bayar lewat aplikasi OVO'],
  ['ewallet', 'DANA', 0, 'Bayar lewat aplikasi DANA'],
  ['ewallet', 'QRIS', 0, 'Scan QRIS dari aplikasi bank atau e-wallet apa pun'],
  ['cod', 'Bayar di Tempat (COD)', 2500, 'Bayar tunai ke kurir saat paket sampai'],
];

// [kode, judul, deskripsi, tipe, nilai, min belanja, maks diskon]
export const PROMOS = [
  ['GAJIAN50', 'Promo Gajian Diskon 50%', 'Diskon 50% untuk belanja minimal Rp100.000.', 'percent', 50, 100000, 50000],
  ['ONGKIRHEMAT', 'Potongan Ongkir', 'Potongan ongkir hingga Rp15.000 tanpa minimal belanja.', 'shipping', 15000, 0, 0],
  ['HEMAT20K', 'Hemat Rp20.000', 'Potongan langsung Rp20.000 untuk belanja minimal Rp150.000.', 'fixed', 20000, 150000, 0],
  ['PASARINBARU', 'Selamat Datang', 'Diskon 10% maksimal Rp25.000 untuk semua pembelian.', 'percent', 10, 0, 25000],
];

export const SEED_REVIEWERS = ['Rina Aulia', 'Budi Santoso', 'Dewi Pratiwi', 'Agus Wibowo', 'Siti Nurhaliza', 'Fajar Ramadhan', 'Nanda Kusuma', 'Putri Maharani'];

export const REVIEW_TEXT = {
  5: ['Barang sesuai deskripsi, packing rapi dan cepat sampai. Recommended!', 'Kualitas bagus untuk harga segini, penjual responsif.', 'Mantap, sesuai ekspektasi. Pasti beli lagi.', 'Pengiriman cepat dan barang aman. Terima kasih!'],
  4: ['Bagus, hanya saja pengiriman agak lama.', 'Sesuai foto. Kemasan sedikit penyok tapi barang aman.', 'Overall puas, harga sebanding dengan kualitas.'],
  3: ['Lumayan, tapi warnanya sedikit berbeda dari foto.', 'Cukup untuk harga segini, tidak terlalu istimewa.'],
  2: ['Kurang puas, ukurannya agak berbeda dari perkiraan.'],
};

export const DEMO_STORE = ['Toko Demo Pasarin', 'Surabaya', 'Toko contoh untuk mencoba tambah, ubah, dan hapus produk.'];
