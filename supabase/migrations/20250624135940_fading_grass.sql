/*
  # Insert Sample Data untuk Testing

  1. Sample Data
    - Demo teacher dan student accounts
    - Sample texts untuk berbagai genre
    - Sample questions untuk testing
    - Sample progress data

  2. Notes
    - Data ini untuk testing dan development
    - Dapat dihapus setelah sistem production ready
*/

-- Insert sample teacher profile (akan dibuat otomatis saat user register)
-- Email: teacher@demo.com, Password: demo123

-- Insert sample texts
INSERT INTO texts (id, title, genre, content, structure, lexicogrammatical, illustration_url, created_by) VALUES
(
  gen_random_uuid(),
  'Legenda Timun Mas',
  'narrative',
  'Di sebuah desa yang tenang, hiduplah seorang janda bernama Mbok Srini. Ia sangat mendambakan seorang anak. Suatu hari, ia bertemu dengan raksasa hijau yang menawarkan bantuan.

"Aku akan memberimu benih timun ajaib," kata raksasa itu. "Namun, jika anak yang lahir sudah berusia 17 tahun, kau harus menyerahkannya padaku."

Mbok Srini yang sangat ingin memiliki anak menyetujui perjanjian tersebut. Ia menanam benih timun yang diberikan raksasa. Tidak lama kemudian, tumbuh pohon timun yang besar dengan buah emas berkilau.

Ketika Mbok Srini membuka buah timun tersebut, keluarlah seorang bayi perempuan yang cantik. Ia menamainya Timun Mas. Gadis itu tumbuh menjadi anak yang baik hati dan cerdas.

Namun, ketika Timun Mas berusia 17 tahun, raksasa datang menagih janji. Mbok Srini tidak ingin kehilangan putrinya. Ia memberikan empat bungkusan berisi biji mentimun, jarum, garam, dan terasi kepada Timun Mas.

"Lemparkan ini jika raksasa mengejarmu," pesan Mbok Srini.

Timun Mas pun lari menjauh. Ketika raksasa mengejarnya, ia melemparkan biji mentimun. Seketika tumbuh hutan mentimun yang lebat. Raksasa terus mengejar, lalu Timun Mas melemparkan jarum. Muncullah pohon bambu runcing yang tinggi.

Akhirnya, Timun Mas melemparkan garam dan terasi. Munculah lautan asin yang mendidih. Raksasa tidak dapat berenang dan tenggelam. Timun Mas selamat dan kembali ke rumah Mbok Srini.',
  '{"orientasi": "Di sebuah desa yang tenang, hiduplah seorang janda bernama Mbok Srini. Ia sangat mendambakan seorang anak.", "komplikasi": "Ketika Timun Mas berusia 17 tahun, raksasa datang menagih janji. Mbok Srini tidak ingin kehilangan putrinya.", "resolusi": "Timun Mas menggunakan benda-benda ajaib untuk mengalahkan raksasa dan kembali ke rumah dengan selamat."}',
  ARRAY['kata kerja aksi', 'kata sifat', 'konjungsi waktu', 'kata ganti orang'],
  'https://images.pexels.com/photos/1427107/pexels-photo-1427107.jpeg?auto=compress&cs=tinysrgb&w=800',
  (SELECT id FROM profiles WHERE role = 'teacher' LIMIT 1)
),
(
  gen_random_uuid(),
  'Dampak Media Sosial terhadap Remaja',
  'expository',
  'Media sosial telah menjadi bagian yang tidak terpisahkan dari kehidupan remaja masa kini. Platform seperti Instagram, TikTok, dan Twitter memberikan ruang bagi remaja untuk mengekspresikan diri dan berinteraksi dengan teman sebaya.

Namun, penggunaan media sosial yang berlebihan dapat menimbulkan dampak negatif. Penelitian menunjukkan bahwa remaja yang menghabiskan lebih dari 3 jam sehari di media sosial memiliki risiko lebih tinggi mengalami gangguan mental seperti kecemasan dan depresi.

Selain itu, media sosial juga dapat memicu perilaku perbandingan sosial. Remaja sering membandingkan kehidupan mereka dengan postingan orang lain yang terlihat sempurna, padahal itu hanya menampilkan sisi terbaik saja.

Di sisi positif, media sosial dapat menjadi sarana pembelajaran dan pengembangan kreativitas. Banyak remaja yang menggunakan platform ini untuk berbagi karya seni, musik, atau tulisan mereka.

Oleh karena itu, penting bagi orang tua dan guru untuk membimbing remaja dalam menggunakan media sosial secara bijak dan seimbang.',
  '{"tesis": "Media sosial telah menjadi bagian yang tidak terpisahkan dari kehidupan remaja masa kini.", "argumen": "Penggunaan media sosial dapat memberikan dampak positif dan negatif bagi remaja.", "kesimpulan": "Penting untuk membimbing remaja dalam menggunakan media sosial secara bijak dan seimbang."}',
  ARRAY['kata hubung', 'kata kerja mental', 'istilah teknis', 'kalimat kompleks'],
  'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=800',
  (SELECT id FROM profiles WHERE role = 'teacher' LIMIT 1)
),
(
  gen_random_uuid(),
  'Keindahan Candi Borobudur',
  'descriptive',
  'Candi Borobudur merupakan salah satu keajaiban dunia yang terletak di Magelang, Jawa Tengah. Candi Buddha terbesar di dunia ini dibangun pada abad ke-8 dan ke-9 Masehi oleh Dinasti Syailendra.

Struktur Candi Borobudur berbentuk mandala yang terdiri dari sepuluh tingkat. Tiga tingkat bawah berbentuk persegi yang melambangkan Kamadhatu (dunia nafsu), lima tingkat tengah berbentuk persegi yang melambangkan Rupadhatu (dunia bentuk), dan dua tingkat atas berbentuk bundar yang melambangkan Arupadhatu (dunia tanpa bentuk).

Dinding-dinding candi dihiasi dengan 2.672 panel relief yang menceritakan kisah-kisah Buddha. Relief-relief ini dipahat dengan sangat detail dan artistik, menggambarkan kehidupan masyarakat pada masa itu. Selain itu, terdapat 504 arca Buddha yang tersebar di berbagai tingkat candi.

Puncak candi dihiasi dengan stupa induk yang dikelilingi oleh 72 stupa kecil berbentuk lonceng. Setiap stupa kecil berisi arca Buddha yang duduk bersila dalam posisi meditasi. Pemandangan dari puncak candi sangat memukau, terutama saat matahari terbit dan terbenam.',
  '{"identifikasi": "Candi Borobudur merupakan salah satu keajaiban dunia yang terletak di Magelang, Jawa Tengah.", "deskripsi": "Struktur candi berbentuk mandala dengan sepuluh tingkat, dihiasi relief dan arca Buddha yang indah."}',
  ARRAY['kata sifat deskriptif', 'kata bilangan', 'frasa nomina', 'kalimat majemuk'],
  'https://images.pexels.com/photos/2161467/pexels-photo-2161467.jpeg?auto=compress&cs=tinysrgb&w=800',
  (SELECT id FROM profiles WHERE role = 'teacher' LIMIT 1)
),
(
  gen_random_uuid(),
  'Cara Membuat Rendang Daging',
  'procedural',
  'Rendang adalah masakan tradisional Minangkabau yang terkenal di seluruh dunia. Berikut adalah cara membuat rendang daging yang lezat dan autentik.

Bahan-bahan yang diperlukan:
- 1 kg daging sapi, potong kotak
- 1 liter santan kental
- 2 batang serai, memarkan
- 4 lembar daun jeruk
- 2 lembar daun kunyit
- 1 batang kayu manis
- Garam dan gula secukupnya

Bumbu halus:
- 15 buah cabai merah
- 8 buah bawang merah
- 6 siung bawang putih
- 3 cm jahe
- 3 cm lengkuas
- 2 cm kunyit

Langkah-langkah pembuatan:
1. Haluskan semua bumbu menggunakan blender atau cobek
2. Tumis bumbu halus hingga harum dan matang
3. Masukkan daging, aduk hingga berubah warna
4. Tuang santan, masukkan serai, daun jeruk, dan daun kunyit
5. Masak dengan api sedang sambil terus diaduk
6. Tambahkan garam dan gula sesuai selera
7. Masak hingga santan mengental dan daging empuk (sekitar 2-3 jam)
8. Aduk sesekali agar tidak gosong
9. Rendang siap disajikan dengan nasi putih hangat',
  '{"tujuan": "Membuat rendang daging yang lezat dan autentik", "langkah": "Proses memasak dimulai dari menghaluskan bumbu hingga memasak dengan santan sampai mengental"}',
  ARRAY['kata kerja imperatif', 'kata bilangan', 'konjungsi urutan', 'keterangan waktu'],
  'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800',
  (SELECT id FROM profiles WHERE role = 'teacher' LIMIT 1)
),
(
  gen_random_uuid(),
  'Pentingnya Menjaga Lingkungan Hidup',
  'persuasive',
  'Lingkungan hidup adalah rumah bersama bagi seluruh makhluk di bumi. Namun, kondisi lingkungan saat ini semakin memprihatinkan akibat ulah manusia yang tidak bertanggung jawab. Oleh karena itu, kita semua harus berperan aktif dalam menjaga kelestarian lingkungan.

Kerusakan lingkungan telah mencapai tingkat yang mengkhawatirkan. Hutan-hutan gundul akibat penebangan liar, sungai-sungai tercemar limbah industri, dan udara yang semakin kotor karena asap kendaraan dan pabrik. Dampaknya sangat nyata: banjir, tanah longsor, dan perubahan iklim yang ekstrem.

Jika kita tidak segera bertindak, generasi mendatang akan mewarisi bumi yang rusak. Mereka tidak akan merasakan udara segar, air bersih, dan keindahan alam seperti yang kita nikmati saat ini. Apakah kita tega meninggalkan warisan buruk untuk anak cucu kita?

Menjaga lingkungan bukanlah tugas yang sulit. Dimulai dari hal-hal sederhana seperti membuang sampah pada tempatnya, menghemat air dan listrik, serta menggunakan transportasi umum. Setiap tindakan kecil yang kita lakukan akan memberikan dampak besar bagi kelestarian bumi.

Mari bersama-sama menjaga lingkungan hidup. Mulai dari diri sendiri, mulai dari sekarang, dan mulai dari hal-hal kecil. Bumi adalah satu-satunya rumah yang kita miliki, jadi jagalah dengan sebaik-baiknya.',
  '{"pernyataan": "Kita semua harus berperan aktif dalam menjaga kelestarian lingkungan", "alasan": "Kerusakan lingkungan telah mencapai tingkat mengkhawatirkan dan akan berdampak pada generasi mendatang"}',
  ARRAY['kata persuasif', 'kalimat tanya retoris', 'kata emotif', 'kalimat ajakan'],
  'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=800',
  (SELECT id FROM profiles WHERE role = 'teacher' LIMIT 1)
);

-- Insert sample questions (akan diinsert setelah texts ada)
-- Note: Ini akan dijalankan setelah ada data texts dan profiles