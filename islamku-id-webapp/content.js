/* ==========================================================================
   content.js — Konten statis Islamku.id
   Teks Tahlil, Manaqib, Ratib, Dzikir, dan Artikel disimpan di sini sebagai
   data terstruktur, supaya mudah ditinjau/diedit oleh admin/ustadz
   pendamping sebelum publish, tanpa menyentuh logika aplikasi di app.js.
   ========================================================================== */

/* Ayat pilihan untuk kartu "Ayat Hari Ini" di Beranda.
   Hanya berisi referensi { surat, ayat } — teks Arab & terjemahan diambil
   langsung dari API EQuran.id supaya selalu akurat & konsisten dengan
   sumber yang sama dipakai halaman Al-Qur'an. Ayat dipilih berdasarkan
   tanggal (epoch day) agar semua pengguna melihat ayat yang sama di hari
   yang sama. */
const AYAT_PILIHAN = [
  { surat: 94, ayat: 6, label: "Al-Insyirah" },
  { surat: 2, ayat: 286, label: "Al-Baqarah" },
  { surat: 65, ayat: 3, label: "At-Talaq" },
  { surat: 13, ayat: 28, label: "Ar-Ra'd" },
  { surat: 3, ayat: 139, label: "Ali 'Imran" },
  { surat: 39, ayat: 53, label: "Az-Zumar" },
  { surat: 2, ayat: 153, label: "Al-Baqarah" },
  { surat: 94, ayat: 5, label: "Al-Insyirah" },
  { surat: 29, ayat: 69, label: "Al-'Ankabut" },
  { surat: 3, ayat: 159, label: "Ali 'Imran" },
  { surat: 49, ayat: 13, label: "Al-Hujurat" },
  { surat: 20, ayat: 25, label: "Taha" },
  { surat: 16, ayat: 97, label: "An-Nahl" },
  { surat: 9, ayat: 40, label: "At-Taubah" },
  { surat: 12, ayat: 87, label: "Yusuf" },
];

/* ---------------------------- TAHLIL ---------------------------- */
const TAHLIL = {
  title: "Bacaan Tahlil",
  subtitle: "Susunan umum tahlil & doa arwah",
  sections: [
    {
      heading: "Pembuka",
      items: [
        {
          ar: "بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ",
          tr: "Bismillāhir-raḥmānir-raḥīm",
          id: "Dengan menyebut nama Allah Yang Maha Pengasih lagi Maha Penyayang.",
        },
      ],
    },
    {
      heading: "Surat Al-Fatihah (dihadiahkan pahalanya)",
      items: [
        {
          ar: "اَلْفَاتِحَة …",
          tr: "Al-Fātiḥah, ila hadhratin Nabiyyil Muṣṭafā Muḥammadin ﷺ wa ilā ahli baitihi wa aṣḥābihi wa ilā arwāḥi …",
          id: "Al-Fatihah dihadiahkan kepada Nabi Muhammad ﷺ, keluarga, sahabat, dan arwah yang dituju.",
        },
      ],
    },
    {
      heading: "Surat Al-Ikhlas (3x)",
      items: [
        {
          ar: "قُلْ هُوَ اللّٰهُ اَحَدٌ ۝ اَللّٰهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُوْلَدْ ۝ وَلَمْ يَكُنْ لَّهٗ كُفُوًا اَحَدٌ",
          tr: "Qul huwallāhu aḥad, Allāhuṣ-ṣamad, lam yalid wa lam yūlad, wa lam yakul lahū kufuwan aḥad.",
          id: "Katakanlah: Dialah Allah Yang Maha Esa. Allah tempat meminta segala sesuatu. Dia tiada beranak dan tiada pula diperanakkan. Dan tidak ada seorang pun yang setara dengan Dia.",
        },
      ],
    },
    {
      heading: "Surat Al-Falaq",
      items: [
        {
          ar: "قُلْ اَعُوْذُ بِرَبِّ الْفَلَقِ ۝ مِنْ شَرِّ مَا خَلَقَ ۝ وَمِنْ شَرِّ غَاسِقٍ اِذَا وَقَبَ ۝ وَمِنْ شَرِّ النَّفّٰثٰتِ فِى الْعُقَدِ ۝ وَمِنْ شَرِّ حَاسِدٍ اِذَا حَسَدَ",
          tr: "Qul a'ūdzu birabbil falaq, min syarri mā khalaq, wa min syarri ghāsiqin idzā waqab, wa min syarrin naffāṡāti fil 'uqad, wa min syarri ḥāsidin idzā ḥasad.",
          id: "Katakanlah: Aku berlindung kepada Tuhan Yang menguasai subuh, dari kejahatan makhluk-Nya, dari kejahatan malam apabila telah gelap gulita, dari kejahatan wanita-wanita tukang sihir, dan dari kejahatan orang yang dengki.",
        },
      ],
    },
    {
      heading: "Surat An-Nas",
      items: [
        {
          ar: "قُلْ اَعُوْذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ اِلٰهِ النَّاسِ ۝ مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِيْ يُوَسْوِسُ فِيْ صُدُوْرِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ",
          tr: "Qul a'ūdzu birabbin nās, malikin nās, ilāhin nās, min syarril waswāsil khannās, alladzī yuwaswisu fī ṣudūrin nās, minal jinnati wan nās.",
          id: "Katakanlah: Aku berlindung kepada Tuhan (yang memelihara dan menguasai) manusia, Raja manusia, sembahan manusia, dari kejahatan (bisikan) setan yang bersembunyi, yang membisikkan (kejahatan) ke dalam dada manusia, dari golongan jin dan manusia.",
        },
      ],
    },
    {
      heading: "Ayat Kursi",
      items: [
        {
          ar: "اَللّٰهُ لَآ اِلٰهَ اِلَّا هُوَ الْحَيُّ الْقَيُّوْمُ ۚ لَا تَأْخُذُهٗ سِنَةٌ وَّلَا نَوْمٌ ۗ …",
          tr: "Allāhu lā ilāha illā huwal ḥayyul qayyūm, lā ta'khużuhū sinatuw wa lā naum …",
          id: "Allah, tidak ada Tuhan selain Dia. Yang Maha Hidup, Yang terus-menerus mengurus makhluk-Nya. Tidak mengantuk dan tidak tidur …",
        },
      ],
    },
    {
      heading: "Kalimat Tahlil (33x atau sesuai kesepakatan majelis)",
      items: [
        {
          ar: "لَآ اِلٰهَ اِلَّا اللّٰهُ",
          tr: "Lā ilāha illallāh",
          id: "Tiada Tuhan selain Allah.",
        },
      ],
    },
    {
      heading: "Tasbih, Tahmid, Takbir",
      items: [
        {
          ar: "سُبْحَانَ اللّٰهِ وَبِحَمْدِهٖ",
          tr: "Subḥānallāhi wa biḥamdih (33x)",
          id: "Maha Suci Allah dan segala puji bagi-Nya.",
        },
        {
          ar: "اَلْحَمْدُ لِلّٰهِ رَبِّ الْعَالَمِيْنَ",
          tr: "Alḥamdulillāhi rabbil 'ālamīn (33x)",
          id: "Segala puji bagi Allah, Tuhan semesta alam.",
        },
        {
          ar: "اَللّٰهُ اَكْبَرُ",
          tr: "Allāhu akbar (33x)",
          id: "Allah Maha Besar.",
        },
      ],
    },
    {
      heading: "Doa Penutup",
      items: [
        {
          ar: "اَللّٰهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ …",
          tr: "Allāhummaghfir lahū warḥamhu wa 'āfihī wa'fu 'anhu …",
          id: "Ya Allah, ampunilah dia, rahmatilah dia, sejahterakanlah dia, dan maafkanlah dia …",
        },
      ],
    },
  ],
  note: "Susunan di atas adalah kerangka umum yang lazim dipakai di berbagai majelis tahlil. Mohon disesuaikan/diverifikasi dengan rujukan/ustadz pembina majelis masing-masing sebelum dipakai secara resmi.",
};

/* ---------------------------- MANAQIB ---------------------------- */
const MANAQIB = {
  title: "Manaqib Syekh Abdul Qadir Al-Jailani",
  subtitle: "Susunan ringkas-lengkap untuk pembacaan majelis dan haul",
  sections: [
    {
      heading: "Pembuka Majelis",
      body: "Majelis dibuka dengan bacaan Al-Fatihah yang dihadiahkan kepada Rasulullah ﷺ, para wali Allah, khususnya kepada Sulthanul Auliya' Syekh Abdul Qadir Al-Jailani rahimahullah, serta kepada seluruh masyayikh dan ahli silsilah.",
    },
    {
      heading: "Riwayat Kelahiran & Nasab",
      body: "Syekh Abdul Qadir Al-Jailani lahir di Jailan (Gilan), Persia, pada tahun 470 H / 1077 M. Beliau berasal dari keturunan yang mulia, bersambung kepada Sayyidina Hasan bin Ali dari jalur ayah, dan Sayyidina Husain bin Ali dari jalur ibu.",
    },
    {
      heading: "Perjalanan Menuntut Ilmu",
      body: "Pada usia muda, beliau berangkat ke Baghdad untuk menuntut ilmu agama — fiqih, hadits, tafsir, dan tasawuf — kepada ulama-ulama besar di masanya, hingga dikenal luas keilmuannya.",
    },
    {
      heading: "Keteladanan & Dakwah",
      body: "Syekh Abdul Qadir dikenal dengan akhlaknya yang mulia, ketekunan ibadahnya, dan nasihat-nasihatnya yang menyentuh hati. Majelis pengajiannya di Baghdad dihadiri ribuan orang dari berbagai kalangan, dan banyak yang bertaubat serta kembali kepada jalan Allah melalui bimbingan beliau.",
    },
    {
      heading: "Karya & Warisan",
      body: "Di antara karya beliau yang masyhur adalah kitab Al-Ghunyah li Thalibi Thariqil Haqq dan Futuhul Ghaib. Ajaran dan tarekat yang dinisbahkan kepada beliau (Qadiriyyah) tersebar luas hingga ke Nusantara dan menjadi salah satu tarekat besar yang diamalkan umat Islam Indonesia.",
    },
    {
      heading: "Penutup & Doa",
      body: "Semoga dengan membaca manaqib ini, kita dapat mengambil ibrah dan keteladanan dari perjalanan hidup Syekh Abdul Qadir Al-Jailani, serta memperoleh keberkahan (tabarruk) dari kecintaan kepada para wali Allah.",
    },
    {
      heading: "Tawassul dan Hadiah Al-Fatihah",
      body: "Al-Fatihah ila hadhratin Nabi al-Musthafa Sayyidina Muhammadin shallallahu 'alaihi wa sallam, wa ila jami'i ikhwanihi minal anbiya'i wal mursalin, wal mala'ikatil muqarrabin, wash-shahabati wat-tabi'in, wal auliya'i wash-shalihin, khususon ila Sulthanil Auliya' Syekh Abdul Qadir Al-Jailani radhiyallahu 'anhu, wa ila arwahi masyayikhina wa asatidzatina wa ahli quburina wal muslimina wal muslimat. Al-Fatihah.",
    },
    {
      heading: "Kelahiran dan Masa Kecil",
      body: "Beliau lahir di wilayah Jailan pada tahun 470 H. Sejak kecil tampak tanda kecintaan kepada ilmu dan ibadah. Beliau tumbuh dalam keluarga yang dikenal saleh, menjaga kehormatan, dan mendidik anak dengan adab kepada Allah serta Rasul-Nya.",
    },
    {
      heading: "Hijrah ke Baghdad",
      body: "Pada usia muda beliau berangkat menuju Baghdad untuk menuntut ilmu. Dalam perjalanan beliau diuji oleh perampok, namun tetap jujur ketika ditanya tentang harta yang dibawa. Kejujuran itu menjadi sebab para perampok bertaubat dan menyadari pentingnya takut kepada Allah.",
    },
    {
      heading: "Guru dan Keilmuan",
      body: "Di Baghdad beliau mempelajari Al-Qur'an, hadits, fiqih, ushul, adab, dan tasawuf kepada para ulama. Beliau dikenal tekun menghadiri majelis ilmu, menjaga wudhu, memperbanyak ibadah, serta mengamalkan ilmu sebelum menyampaikannya kepada masyarakat.",
    },
    {
      heading: "Mujahadah dan Akhlak",
      body: "Beliau mengajarkan taubat, zuhud, tawakal, sabar, menjaga halal-haram, berbakti kepada orang tua, dan memperbaiki hati. Kemuliaan seorang hamba menurut nasihat beliau bukan pada pakaian atau banyaknya pengikut, tetapi pada takwa, kejujuran, dan manfaat bagi sesama.",
    },
    {
      heading: "Dakwah di Baghdad",
      body: "Setelah mendapat kepercayaan ulama, beliau berdakwah dan membimbing masyarakat. Majelisnya dihadiri banyak orang. Nasihat beliau menggabungkan syariat dan penyucian jiwa: shalat dijaga, rezeki dicari dengan halal, hak manusia ditunaikan, dan hati dibersihkan dari sombong serta dengki.",
    },
    {
      heading: "Wasiat-Wasiat Utama",
      body: "Jagalah perintah Allah, jauhi larangan-Nya, ridhalah terhadap takdir, jangan menggantungkan hati kepada makhluk, dan kembalikan segala urusan kepada Allah. Perbanyak istighfar, shalawat, sedekah, serta hadirkan rasa diawasi Allah dalam setiap keadaan.",
    },
    {
      heading: "Wafat dan Warisan",
      body: "Syekh Abdul Qadir Al-Jailani wafat di Baghdad pada tahun 561 H. Beliau meninggalkan karya dan murid yang meneruskan dakwah ilmu, adab, dan tazkiyah. Peringatan manaqib hendaknya menjadi sarana mengambil pelajaran dan memperbaiki amal, bukan sekadar membaca kisah.",
    },
  ],
  note: "Susunan ini merangkum bacaan yang umum digunakan dalam majelis manaqib NU. Lafal tawassul, urutan, dan kisah dapat berbeda menurut kitab/ijazah masing-masing majelis; verifikasi dengan pengasuh atau ustadz sebelum pembacaan resmi.",
};

/* ---------------------------- RATIB AL-HADDAD ---------------------------- */
const RATIB_HADDAD = {
  title: "Ratib Al-Haddad",
  subtitle: "Susunan dzikir karya Al-Habib Abdullah bin Alawi Al-Haddad",
  items: [
    {
      ar: "أَسْتَغْفِرُ اللّٰهَ الْعَظِيْمَ",
      tr: "Astaghfirullāhal 'aẓīm",
      id: "Aku memohon ampun kepada Allah Yang Maha Agung.",
      count: 3,
    },
    {
      ar: "أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللّٰهُ",
      tr: "Asyhadu al lā ilāha illallāh",
      id: "Aku bersaksi tiada Tuhan selain Allah.",
      count: 3,
    },
    {
      ar: "اَللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ",
      tr: "Allāhumma ṣalli 'alā sayyidinā Muḥammad",
      id: "Ya Allah, limpahkanlah shalawat kepada junjungan kami Nabi Muhammad.",
      count: 3,
    },
    {
      ar: "رَضِيْتُ بِاللّٰهِ رَبًّا وَبِالْإِسْلَامِ دِيْنًا وَبِمُحَمَّدٍ ﷺ نَبِيًّا وَرَسُوْلًا",
      tr: "Raḍītu billāhi rabbā, wa bil islāmi dīnā, wa bimuḥammadin ﷺ nabiyyaw wa rasūlā",
      id: "Aku ridha Allah sebagai Tuhan, Islam sebagai agama, dan Muhammad ﷺ sebagai Nabi dan Rasul.",
      count: 3,
    },
    {
      ar: "بِسْمِ اللّٰهِ الَّذِيْ لَا يَضُرُّ مَعَ اسْمِهٖ شَيْءٌ فِى الْأَرْضِ وَلَا فِى السَّمَاءِ وَهُوَ السَّمِيْعُ الْعَلِيْمُ",
      tr: "Bismillāhil-ladzī lā yaḍurru ma'asmihī syai'un fil arḍi wa lā fis-samā'i wa huwas-samī'ul 'alīm",
      id: "Dengan nama Allah yang bersama nama-Nya tidak ada satu pun yang dapat membahayakan, baik di bumi maupun di langit. Dan Dia Maha Mendengar lagi Maha Mengetahui.",
      count: 3,
    },
    {
      ar: "سُبْحَانَ اللّٰهِ وَالْحَمْدُ لِلّٰهِ وَلَا إِلٰهَ إِلَّا اللّٰهُ وَاللّٰهُ أَكْبَرُ",
      tr: "Subḥānallāhi wal ḥamdulillāhi wa lā ilāha illallāhu wallāhu akbar",
      id: "Maha Suci Allah, segala puji bagi Allah, tiada Tuhan selain Allah, dan Allah Maha Besar.",
      count: 3,
    },
    {
      ar: "سُبْحَانَ اللّٰهِ وَبِحَمْدِهٖ عَدَدَ خَلْقِهٖ",
      tr: "Subḥānallāhi wa biḥamdihī 'adada khalqih",
      id: "Maha Suci Allah dan segala puji bagi-Nya sebanyak bilangan makhluk-Nya.",
      count: 3,
    },
    {
      ar: "سُوْرَةُ الْإِخْلَاصِ",
      tr: "Al-Ikhlas",
      id: "(Membaca Surat Al-Ikhlas)",
      count: 3,
    },
    {
      ar: "سُوْرَةُ الْفَلَقِ",
      tr: "Al-Falaq",
      id: "(Membaca Surat Al-Falaq)",
      count: 1,
    },
    {
      ar: "سُوْرَةُ النَّاسِ",
      tr: "An-Nas",
      id: "(Membaca Surat An-Nas)",
      count: 1,
    },
    {
      ar: "آيَةُ الْكُرْسِيِّ",
      tr: "Ayat Kursi",
      id: "(Membaca Ayat Kursi)",
      count: 1,
    },
    {
      ar: "يَا حَيُّ يَا قَيُّوْمُ لَا إِلٰهَ إِلَّا أَنْتَ",
      tr: "Yā ḥayyu yā qayyūmu lā ilāha illā anta",
      id: "Wahai Yang Maha Hidup, wahai Yang Maha Berdiri Sendiri, tiada Tuhan selain Engkau.",
      count: 3,
    },
  ],
  note: "Susunan ini mengikuti bacaan ringkas yang lazim digunakan di majelis NU. Beberapa majelis menambahkan hizib, doa, atau hitungan tertentu sesuai ijazah guru.",
};

const RATIB_ATHOS = {
  title: "Ratib Al-Athos",
  subtitle: "Susunan dzikir Ratib Al-Athos yang umum dibaca di majelis",
  items: [
    {
      ar: "أَسْتَغْفِرُ اللّٰهَ الْعَظِيْمَ الَّذِيْ لَا إِلٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّوْمُ وَأَتُوْبُ إِلَيْهِ",
      tr: "Astaghfirullāhal 'aẓīm...",
      id: "Aku memohon ampun kepada Allah Yang Maha Agung dan bertaubat kepada-Nya.",
      count: 3,
    },
    {
      ar: "لَا إِلٰهَ إِلَّا اللّٰهُ",
      tr: "Lā ilāha illallāh",
      id: "Tiada Tuhan selain Allah.",
      count: 3,
    },
    {
      ar: "مُحَمَّدٌ رَسُوْلُ اللّٰهِ صَلَّى اللّٰهُ عَلَيْهِ وَسَلَّمَ",
      tr: "Muḥammadur Rasūlullāh",
      id: "Muhammad adalah utusan Allah.",
      count: 3,
    },
    {
      ar: "اللّٰهُمَّ صَلِّ وَسَلِّمْ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ",
      tr: "Allāhumma ṣalli wa sallim 'alā sayyidinā Muḥammad...",
      id: "Ya Allah, limpahkan shalawat dan salam kepada Nabi Muhammad dan keluarganya.",
      count: 3,
    },
    {
      ar: "سُبْحَانَ اللّٰهِ وَالْحَمْدُ لِلّٰهِ وَلَا إِلٰهَ إِلَّا اللّٰهُ وَاللّٰهُ أَكْبَرُ",
      tr: "Subḥānallāh wal-ḥamdu lillāh...",
      id: "Mahasuci Allah, segala puji bagi Allah, tiada Tuhan selain Allah, dan Allah Mahabesar.",
      count: 3,
    },
    {
      ar: "حَسْبُنَا اللّٰهُ وَنِعْمَ الْوَكِيْلُ",
      tr: "Ḥasbunallāhu wa ni'mal-wakīl",
      id: "Cukuplah Allah bagi kami dan Dia sebaik-baik pelindung.",
      count: 7,
    },
    {
      ar: "يَا لَطِيْفًا بِخَلْقِهِ يَا عَلِيْمًا بِخَلْقِهِ اُلْطُفْ بِنَا يَا لَطِيْفُ",
      tr: "Yā Laṭīfan bikhalqih...",
      id: "Wahai Yang Maha Lembut kepada makhluk-Nya, lembutlah kepada kami wahai Yang Maha Lembut.",
      count: 3,
    },
    {
      ar: "يَا حَيُّ يَا قَيُّوْمُ بِرَحْمَتِكَ أَسْتَغِيْثُ أَصْلِحْ لِيْ شَأْنِيْ كُلَّهُ",
      tr: "Yā Ḥayyu yā Qayyūm...",
      id: "Wahai Yang Maha Hidup, dengan rahmat-Mu aku memohon pertolongan. Perbaikilah seluruh urusanku.",
      count: 3,
    },
    {
      ar: "رَبَّنَا اغْفِرْ لَنَا وَلِوَالِدِيْنَا وَلِمَشَايِخِنَا وَلِمُعَلِّمِيْنَا وَلِجَمِيْعِ الْمُسْلِمِيْنَ",
      tr: "Rabbanaghfir lanā wa liwālidaynā...",
      id: "Ya Tuhan kami, ampunilah kami, orang tua, guru, dan seluruh kaum muslimin.",
      count: 3,
    },
    {
      ar: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
      tr: "Rabbanā ātinā fid-dunyā ḥasanah...",
      id: "Ya Tuhan kami, berilah kami kebaikan di dunia dan akhirat serta lindungi dari siksa neraka.",
      count: 3,
    },
    {
      ar: "الْفَاتِحَةُ إِلَى حَضْرَةِ النَّبِيِّ الْمُصْطَفَى مُحَمَّدٍ صَلَّى اللّٰهُ عَلَيْهِ وَسَلَّمَ",
      tr: "Al-Fātiḥah ilā ḥaḍratin Nabiyyil-Muṣṭafā...",
      id: "Al-Fatihah sebagai hadiah kepada Nabi Muhammad, keluarga, sahabat, guru, dan seluruh kaum muslimin.",
      count: 1,
    },
  ],
  note: "Ratib Al-Athos memiliki beberapa versi lafal dan hitungan. Cocokkan dengan kitab ratib dan ijazah majelis setempat.",
};

const RATIB_VERSIONS = [RATIB_HADDAD, RATIB_ATHOS];

/* ---------------------------- DZIKIR & WIRID ---------------------------- */
const DZIKIR = {
  categories: [
    {
      id: "pagi",
      title: "Dzikir Pagi",
      subtitle: "Dibaca setelah Subuh hingga terbit matahari",
      items: [
        {
          ar: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلّٰهِ، وَالْحَمْدُ لِلّٰهِ",
          tr: "Aṣbaḥnā wa aṣbaḥal mulku lillāh, wal ḥamdu lillāh",
          id: "Kami memasuki waktu pagi dan kerajaan hanya milik Allah, segala puji bagi Allah.",
          count: 1,
        },
        {
          ar: "اَللّٰهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا",
          tr: "Allāhumma bika aṣbaḥnā wa bika amsainā",
          id: "Ya Allah, dengan (pertolongan)-Mu kami memasuki pagi dan sore hari.",
          count: 1,
        },
        {
          ar: "سُبْحَانَ اللّٰهِ وَبِحَمْدِهٖ",
          tr: "Subḥānallāhi wa biḥamdih",
          id: "Maha Suci Allah dan segala puji bagi-Nya.",
          count: 100,
        },
      ],
    },
    {
      id: "petang",
      title: "Dzikir Petang",
      subtitle: "Dibaca setelah Ashar hingga Maghrib",
      items: [
        {
          ar: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلّٰهِ، وَالْحَمْدُ لِلّٰهِ",
          tr: "Amsainā wa amsal mulku lillāh, wal ḥamdu lillāh",
          id: "Kami memasuki waktu sore dan kerajaan hanya milik Allah, segala puji bagi Allah.",
          count: 1,
        },
        {
          ar: "أَعُوْذُ بِكَلِمَاتِ اللّٰهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
          tr: "A'ūdzu bikalimātillāhit-tāmmāti min syarri mā khalaq",
          id: "Aku berlindung dengan kalimat-kalimat Allah yang sempurna dari kejahatan makhluk-Nya.",
          count: 3,
        },
        {
          ar: "أَسْتَغْفِرُ اللّٰهَ",
          tr: "Astaghfirullāh",
          id: "Aku memohon ampun kepada Allah.",
          count: 100,
        },
      ],
    },
    {
      id: "setelah-shalat",
      title: "Dzikir Setelah Shalat",
      subtitle: "Dibaca setiap selesai shalat fardhu",
      items: [
        {
          ar: "أَسْتَغْفِرُ اللّٰهَ",
          tr: "Astaghfirullāh",
          id: "Aku memohon ampun kepada Allah.",
          count: 3,
        },
        {
          ar: "اَللّٰهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ",
          tr: "Allāhumma antas-salāmu wa minkas-salām, tabārakta yā dzal-jalāli wal-ikrām",
          id: "Ya Allah, Engkaulah As-Salam (Yang Maha Sejahtera) dan dari-Mu kesejahteraan, Maha Berkah Engkau, wahai Pemilik keagungan dan kemuliaan.",
          count: 1,
        },
        {
          ar: "سُبْحَانَ اللّٰهِ",
          tr: "Subḥānallāh",
          id: "Maha Suci Allah.",
          count: 33,
        },
        {
          ar: "اَلْحَمْدُ لِلّٰهِ",
          tr: "Alḥamdulillāh",
          id: "Segala puji bagi Allah.",
          count: 33,
        },
        {
          ar: "اَللّٰهُ أَكْبَرُ",
          tr: "Allāhu akbar",
          id: "Allah Maha Besar.",
          count: 33,
        },
        {
          ar: "لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيْكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلٰى كُلِّ شَيْءٍ قَدِيْرٌ",
          tr: "Lā ilāha illallāhu waḥdahū lā syarīka lah, lahul mulku wa lahul ḥamdu wa huwa 'alā kulli syai'in qadīr",
          id: "Tiada Tuhan selain Allah semata, tiada sekutu bagi-Nya. Bagi-Nya kerajaan dan bagi-Nya segala puji, dan Dia Maha Kuasa atas segala sesuatu.",
          count: 1,
        },
      ],
    },
  ],
};

const dzikirPagi = DZIKIR.categories.find((category) => category.id === "pagi");
const dzikirPetang = DZIKIR.categories.find(
  (category) => category.id === "petang",
);
const dzikirSetelahShalat = DZIKIR.categories.find(
  (category) => category.id === "setelah-shalat",
);
const dzikirTambahan = {
  ayatKursi: {
    ar: "آيَةُ الْكُرْسِيِّ",
    tr: "Āyatul Kursī",
    id: "Membaca Ayat Kursi.",
    count: 1,
  },
  tigaQul: {
    ar: "قُلْ هُوَ اللّٰهُ أَحَدٌ ۝ قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
    tr: "Al-Ikhlas, Al-Falaq, dan An-Nas",
    id: "Membaca tiga surat terakhir masing-masing tiga kali.",
    count: 3,
  },
  bismillah: {
    ar: "بِسْمِ اللّٰهِ الَّذِيْ لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيْعُ الْعَلِيْمُ",
    tr: "Bismillāhilladzī lā yaḍurru...",
    id: "Dengan nama Allah, tidak ada sesuatu pun yang membahayakan bersama nama-Nya.",
    count: 3,
  },
  tauhid: {
    ar: "لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيْكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيْرٌ",
    tr: "Lā ilāha illallāhu waḥdahū...",
    id: "Tiada Tuhan selain Allah Yang Esa, tiada sekutu bagi-Nya.",
    count: 10,
  },
  shalawat: {
    ar: "اللّٰهُمَّ صَلِّ وَسَلِّمْ عَلَى سَيِّدِنَا مُحَمَّدٍ",
    tr: "Allāhumma ṣalli wa sallim 'alā sayyidinā Muḥammad",
    id: "Ya Allah, limpahkan shalawat dan salam kepada Nabi Muhammad.",
    count: 10,
  },
  doa: {
    ar: "اللّٰهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ",
    tr: "Allāhumma innī as'alukal-'afwa wal-'āfiyah",
    id: "Ya Allah, aku memohon ampunan dan keselamatan di dunia dan akhirat.",
    count: 1,
  },
};
dzikirPagi.items.splice(
  2,
  0,
  dzikirTambahan.ayatKursi,
  dzikirTambahan.tigaQul,
  dzikirTambahan.bismillah,
  dzikirTambahan.tauhid,
  dzikirTambahan.shalawat,
  dzikirTambahan.doa,
);
dzikirPetang.items.splice(
  1,
  0,
  dzikirTambahan.ayatKursi,
  dzikirTambahan.tigaQul,
  dzikirTambahan.bismillah,
  dzikirTambahan.tauhid,
  dzikirTambahan.shalawat,
);
dzikirSetelahShalat.items.splice(
  2,
  0,
  dzikirTambahan.ayatKursi,
  dzikirTambahan.doa,
);

/* ---------------------------- ARTIKEL ISLAMI ---------------------------- */
/* Contoh konten awal. Di produksi, array ini idealnya diambil dari CMS/API
   (lihat PRD §5.8) supaya bisa terbit otomatis setiap hari tanpa deploy
   ulang. Untuk versi unduhan ini, artikel disusun sebagai data statis yang
   mudah ditambah — cukup sisipkan objek baru di awal array `ARTIKEL`. */
const ARTIKEL = [
  {
    id: "mtq-nasional-2026-semarang",
    kategori: "Agama",
    judul: "MTQ Nasional XXXI di Semarang: Al-Qur'an Jadi Panggung Bersama",
    tanggal: "29 September 2026",
    ringkasan: "Rangkuman MTQ Nasional XXXI (11–20 September 2026) di Semarang, dampaknya, dan pandangan Islam tentang memuliakan Al-Qur'an.",
    waktuBaca: "3 menit",
    gambar: "images/artikel-mtq-semarang.svg",
    gambarAlt: "Ilustrasi mushaf terbuka bermotif zamrud dan emas",
    gambarKredit: "Ilustrasi Islamku.id (bukan dokumentasi peristiwa)",
    isi: [
      "## Kronologi",
      "MTQ Nasional XXXI Tahun 2026 digelar di Kota Semarang, Jawa Tengah, pada 11–20 September 2026. Kafilah tiba dan malam ta'aruf berlangsung pada 11 September, pawai ta'aruf dan pembukaan di Lapangan Pancasila Simpang Lima pada 12 September, musabaqah pada 13–18 September, lalu penutupan pada 19 September.",
      "Menurut buku panduan penyelenggara, lebih dari 1.800 peserta bertanding di delapan cabang dan 24 golongan pada belasan venue. Pejabat Kementerian Agama menyebut ini pertama kalinya dalam 47 tahun Jawa Tengah kembali menjadi tuan rumah, disertai inovasi untuk peserta disabilitas dan penilaian dewan hakim.",
      "## Dampak",
      "Ribuan peserta dan tamu datang ke Semarang, dan pemberitaan menyebut sekitar 150 stan UMKM ikut meramaikan acara. Bagi masyarakat, MTQ menjadi kesempatan mendengar tilawah yang baik dan mendorong kecintaan pada Al-Qur'an, terutama di kalangan anak muda.",
      "## Pandangan Islam",
      "Islam memuliakan orang yang belajar dan mengajarkan Al-Qur'an; dalam hadis riwayat Al-Bukhari disebutkan bahwa sebaik-baik orang ialah yang mempelajari Al-Qur'an dan mengajarkannya. Allah juga memerintahkan agar Al-Qur'an dibaca dengan tartil (QS. Al-Muzzammil: 4).",
      "Prestasi musabaqah semestinya menjadi pintu untuk mengamalkan isi Al-Qur'an, dan niat yang lurus tetap menjadi ukuran utama. Upaya membuka ruang bagi penyandang disabilitas sejalan dengan prinsip bahwa kemuliaan diukur dari ketakwaan (QS. Al-Hujurat: 13).",
      "<em>Hasil dan jadwal resmi sebaiknya dicek di kanal panitia. Catatan: pandangan Islam di atas adalah prinsip umum, bukan fatwa. Untuk persoalan hukum yang rinci, tanyakan kepada ulama atau lembaga fatwa yang terpercaya.</em>",
    ],
    sumber: [
      {nama: "detik.com — MTQ Nasional 2026 Digelar di Semarang", url: "https://www.detik.com/hikmah/khazanah/d-8658002/mtq-nasional-2026-digelar-di-semarang-unduh-buku-panduannya-di-sini", tanggal: "2026"},
      {nama: "tirto.id — Jadwal dan timeline MTQ Nasional ke-31", url: "https://tirto.id/mtq-nasional-ke-31-2026-kapan-di-mana-cek-jadwal-timeline-hCBT", tanggal: "2026"},
      {nama: "Lingkar.news — MTQ Nasional 2026 digelar 10 hari", url: "https://lingkar.news/jateng/mtq-nasional-2026-jateng-jadwal-venue-lengkap/", tanggal: "13 September 2026"},
      {nama: "Lingkar.co — Inovasi perdana untuk disabilitas dan dewan hakim", url: "https://lingkar.co/berita/mtq-nasional-2026-di-jawa-tengah-hadirkan-inovasi-perdana-untuk", tanggal: "2026"},
    ],
  },
  {
    id: "kemenag-batasi-hp-madrasah-pesantren",
    kategori: "Pendidikan",
    judul: "Kemenag Batasi HP di Madrasah dan Pesantren: Apa Isinya?",
    tanggal: "29 September 2026",
    ringkasan: "Surat Edaran Sekjen Kemenag Nomor 19 Tahun 2026 mengatur penggunaan gawai di satuan pendidikan keagamaan. Ini isi ringkasnya dan pandangan Islam.",
    waktuBaca: "3 menit",
    gambar: "images/artikel-pendidikan-hp.svg",
    gambarAlt: "Ilustrasi ponsel dicoret sebagai simbol pembatasan gawai",
    gambarKredit: "Ilustrasi Islamku.id (bukan dokumentasi peristiwa)",
    isi: [
      "## Kronologi",
      "Kementerian Agama menerbitkan Surat Edaran Sekretaris Jenderal Nomor 19 Tahun 2026 tentang Pembatasan Penggunaan Gawai atau HP di satuan pendidikan binaan Kemenag, yang mencakup madrasah, pesantren, pendidikan diniyah, dan lembaga sejenis. Penjelasannya disampaikan Sekjen Kemenag pada 20 September 2026.",
      "Menurut pemberitaan, aturan ini tidak dimaksudkan menjauhkan murid dari teknologi; gawai tetap boleh menjadi sarana belajar selama terarah dan proporsional. Satuan pendidikan dapat menyediakan loker penyimpanan gawai, memasukkan aturan ke tata tertib tanpa kekerasan, dan menerapkan sanksi yang mendidik. Pinjaman daring, judi daring, dan aktivitas komersial yang tidak terkait pembelajaran dilarang di lingkungan sekolah. Peran pendampingan orang tua ditekankan.",
      "Pada pekan yang sama, Menag menyatakan kebijakan pendidikan gratis pemerintah juga berlaku untuk madrasah negeri, dan Presiden menerbitkan SK pembentukan Direktorat Jenderal Pesantren di Kemenag.",
      "## Dampak",
      "Yang diharapkan: murid lebih fokus belajar, interaksi langsung dan adab di kelas lebih terjaga, dan risiko judi serta pinjaman daring berkurang. Yang perlu dicermati: pelaksanaannya di lapangan, serta akses belajar bagi murid yang memerlukan gawai untuk tugas.",
      "## Pandangan Islam",
      "Islam menekankan pentingnya ilmu dan adab dalam menuntutnya, serta menjaga waktu (lihat QS. Al-'Ashr). Sikap proporsional sejalan dengan prinsip umat pertengahan atau wasathiyyah (QS. Al-Baqarah: 143): teknologi dimanfaatkan, bukan dilarang mutlak, dan bukan pula dibiarkan tanpa batas.",
      "Larangan judi (QS. Al-Ma'idah: 90) dan riba (QS. Al-Baqarah: 275) juga relevan dengan larangan judi daring dan pinjaman daring berbunga.",
      "<em>Catatan: pandangan Islam di atas adalah prinsip umum, bukan fatwa. Untuk persoalan hukum yang rinci, tanyakan kepada ulama atau lembaga fatwa yang terpercaya.</em>",
    ],
    sumber: [
      {nama: "Majalah Nurani — Kemenag Terbitkan Aturan Batasi Penggunaan HP", url: "https://majalahnurani.com/2026/09/20/kemenag-terbitkan-aturan-batasi-penggunaan-hp-di-madrasah-dan-pesantren/", tanggal: "20 September 2026"},
      {nama: "Kaltim Post — Aturan Baru Kemenag 2026", url: "https://kaltimpost.jawapos.com/nasional/2609200082/aturan-baru-kemenag-2026-santri-dan-guru-tak-boleh-bebas-gunakan-hp-di-pesantren", tanggal: "20 September 2026"},
      {nama: "ChannelSulawesi — Madrasah Negeri Masuk Program Pendidikan Gratis", url: "https://channelsulawesi.id/2026/09/23/menag-pastikan-madrasah-negeri-masuk-program-pendidikan-gratis-pemerintah/", tanggal: "23 September 2026"},
    ],
  },
  {
    id: "kekerasan-seksual-malang-pandangan-islam",
    kategori: "Sosial",
    judul: "Dugaan Kekerasan Seksual di Malang: Kronologi Versi Polisi dan Pandangan Islam",
    tanggal: "29 September 2026",
    ringkasan: "Polisi menetapkan seorang tersangka dalam kasus dugaan kekerasan seksual di Malang. Berikut kronologi versi polisi, dampak, dan sudut pandang Islam.",
    waktuBaca: "4 menit",
    gambar: "images/artikel-kekerasan-seksual.svg",
    gambarAlt: "Ilustrasi perisai dengan tanda centang sebagai simbol perlindungan",
    gambarKredit: "Ilustrasi Islamku.id (bukan dokumentasi peristiwa)",
    isi: [
      "<em>Identitas korban sengaja tidak dimuat. Pelaku masih berstatus tersangka dan belum diputus pengadilan.</em>",
      "## Kronologi menurut polisi",
      "Satreskrim Polresta Malang Kota mengumumkan kasus ini pada 17 September 2026. Menurut polisi, peristiwa bermula Jumat malam 11 September 2026 sekitar pukul 23.00 WIB, ketika korban menghubungi seseorang yang dikenalnya untuk bepergian. Karena sudah larut, ia ditawari datang ke tempat tinggal orang tersebut.",
      "Di sana keduanya berbincang; sekitar pukul 01.00 WIB tersangka disebut mengajak berhubungan seksual. Berdasarkan keterangan yang diterima penyidik, korban menolak namun tersangka tetap memaksa. Laporan dibuat pada 12 September 2026, tersangka berinisial AI (28) ditetapkan dan ditahan, dan barang bukti yang diamankan antara lain pakaian serta botol bekas minuman keras.",
      "Tersangka dijerat UU Nomor 12 Tahun 2022 tentang Tindak Pidana Kekerasan Seksual dan UU Nomor 1 Tahun 2023 tentang KUHP.",
      "## Motif",
      "Dalam pemberitaan yang kami baca, polisi belum menyampaikan motif secara rinci, dan kami tidak berspekulasi. Yang disampaikan polisi adalah bahwa penolakan korban diabaikan.",
      "## Dampak",
      "Kekerasan seksual umumnya meninggalkan luka fisik dan psikis pada korban, seperti trauma, rasa takut, dan stigma. Bagi masyarakat, kasus seperti ini menurunkan rasa aman, terutama bagi perempuan muda yang merantau. Karena itu proses hukum yang cepat dan perlindungan bagi korban sangat penting.",
      "## Pandangan Islam",
      "Islam menjaga lima hal pokok (maqashid syariah), di antaranya jiwa dan kehormatan. Zina dilarang keras (QS. Al-Isra': 32), dan memaksa seseorang melakukannya adalah kezaliman. Dalam prinsip umum, orang yang dipaksa tidak menanggung dosa atas apa yang dipaksakan kepadanya, sehingga korban tidak boleh disalahkan atau distigma.",
      "Minuman keras dilarang dan disebut sebagai perbuatan keji dari langkah setan (QS. Al-Ma'idah: 90); ia tidak pernah menjadi alasan yang membenarkan perbuatan zalim. Sebaliknya, kita diminta bertabayyun dan tidak menyebar kabar sebelum jelas (QS. Al-Hujurat: 6) serta menutup aib korban, sambil tetap mendukung proses hukum yang adil. Para ulama membahas hukuman bagi pelaku secara rinci; di Indonesia prosesnya berjalan melalui hukum positif.",
      "Jika Anda atau orang terdekat mengalami kekerasan seksual, segera cari tempat aman dan laporkan ke polisi atau layanan pengaduan resmi seperti SAPA 129 (Kementerian PPPA).",
      "<em>Catatan: pandangan Islam di atas adalah prinsip umum, bukan fatwa. Untuk persoalan hukum yang rinci, tanyakan kepada ulama atau lembaga fatwa yang terpercaya.</em>",
    ],
    sumber: [
      {nama: "Tribrata News Polri — Polisi Ungkap Kasus Kekerasan Seksual terhadap Mahasiswi di Malang", url: "https://tribratanews.polri.go.id/blog/nasional-3/polisi-ungkap-kasus-kekerasan-seksual-terhadap-mahasiswi-di-malang-106038", tanggal: "17 September 2026"},
      {nama: "BangsaOnline — Polresta Malang Kota Tetapkan Tersangka", url: "https://bangsaonline.com/berita/167310/polresta-malang-kota-tetapkan-tersangka-kasus-dugaan-kekerasan-seksual-di-lowokwaru", tanggal: "17 September 2026"},
      {nama: "Headline.co.id — Polisi Tetapkan AI Tersangka", url: "https://www.headline.co.id/137279/polisi-tetapkan-ai-tersangka-kasus-kekerasan-seksual-di-malang/", tanggal: "17 September 2026"},
    ],
  },
  {
    id: "bi-tahan-suku-bunga-rupiah-pangan",
    kategori: "Ekonomi",
    judul: "BI Tahan Suku Bunga 5,75%: Rupiah Tertekan, Harga Pangan Perlu Diwaspadai",
    tanggal: "29 September 2026",
    ringkasan: "Bank Indonesia mempertahankan BI-Rate 5,75% saat rupiah melemah dan inflasi naik. Ini rangkuman, dampaknya, dan pandangan Islam tentang bunga, penimbunan, dan hidup hemat.",
    waktuBaca: "4 menit",
    gambar: "images/artikel-ekonomi-bi-rate.svg",
    gambarAlt: "Ilustrasi koin dan grafik batang",
    gambarKredit: "Ilustrasi Islamku.id (bukan dokumentasi peristiwa)",
    isi: [
      "## Kronologi",
      "Dalam Rapat Dewan Gubernur pada 22–23 September 2026, Bank Indonesia mempertahankan BI-Rate di 5,75%, dengan suku bunga Deposit Facility 4,75% dan Lending Facility 6,5%. Gubernur BI menyebut keputusan ini konsisten dengan upaya menstabilkan rupiah sambil menjaga inflasi dan pertumbuhan.",
      "Inflasi Agustus 2026 tercatat 3,19% secara tahunan, naik dari 2,88% pada Juli, tetapi masih dalam sasaran 2,5% ± 1%. Rupiah bergerak di kisaran Rp17.900 per dolar AS pada 25 September, sementara cadangan devisa disebut sekitar US$146,5 miliar. Di pasar, harga beras kualitas bawah I tercatat naik 4,03% menjadi Rp15.500 per kg pada 24 September.",
      "## Dampak",
      "Rupiah yang lemah cenderung membuat barang impor dan bahan baku lebih mahal, yang bisa merembet ke harga barang harian. Suku bunga yang tidak turun berarti biaya pembiayaan tetap tinggi bagi pelaku usaha dan penerima kredit. Kenaikan harga pangan paling terasa bagi keluarga berpenghasilan rendah.",
      "## Pandangan Islam",
      "Islam melarang riba (QS. Al-Baqarah: 275), dan Majelis Ulama Indonesia dalam Fatwa Nomor 1 Tahun 2004 menyatakan bunga bank termasuk riba; karena itu keuangan syariah dan pembiayaan bebas riba terus didorong sebagai alternatif.",
      "Penimbunan barang kebutuhan pokok untuk menaikkan harga dicela dalam hadis riwayat Muslim, sehingga pelaku pasar dan pemerintah perlu menjaga distribusi dan keadilan harga. Setiap keluarga juga dianjurkan hemat dan tidak berlebihan (QS. Al-Isra': 26–27), serta menguatkan zakat dan sedekah untuk membantu yang paling terdampak.",
      "<em>Angka pasar bergerak setiap hari; cek data terbaru di Bank Indonesia. Catatan: pandangan Islam di atas adalah prinsip umum, bukan fatwa. Untuk persoalan hukum yang rinci, tanyakan kepada ulama atau lembaga fatwa yang terpercaya.</em>",
    ],
    sumber: [
      {nama: "Suara.com — BI Pertahankan BI-Rate 5,75 Persen", url: "https://www.suara.com/bisnis/2026/09/28/090000/bi-pertahankan-bi-rate-575-persen-di-tengah-tekanan-global", tanggal: "28 September 2026"},
      {nama: "Dewan Ekonomi Nasional — Monetary Brief September 2026", url: "https://dewanekonomi.go.id/en/publications/monetary-brief-september-2026", tanggal: "September 2026"},
      {nama: "Bisnis.com — IHSG Dibuka Turun 0,89%", url: "https://market.bisnis.com/read/20260928/7/2007689/ihsg-dibuka-turun-089-saham-bbca-hingga-saham-pack-milik-haji-isam-ambrol", tanggal: "28 September 2026"},
      {nama: "IDX Channel — Harga Pangan 24 September 2026", url: "https://www.idxchannel.com/economics/mayoritas-harga-pangan-24-september-2026-turun-ini-daftarnya", tanggal: "24 September 2026"},
    ],
  },
  {
    id: "rapbn-2027-paripurna-subsidi-energi",
    kategori: "Politik",
    judul: "RAPBN 2027 Menuju Paripurna DPR: Subsidi Energi Rp261,5 Triliun",
    tanggal: "29 September 2026",
    ringkasan: "DPR dijadwalkan mengesahkan APBN 2027 pada 29 September 2026. Ini alur pembahasan, dampaknya, dan pandangan Islam tentang amanah dan musyawarah.",
    waktuBaca: "3 menit",
    gambar: "images/artikel-politik-apbn.svg",
    gambarAlt: "Ilustrasi timbangan sebagai simbol keadilan",
    gambarKredit: "Ilustrasi Islamku.id (bukan dokumentasi peristiwa)",
    isi: [
      "## Kronologi",
      "Setelah Presiden menyampaikan Pidato Nota Keuangan dan RAPBN 2027, pemerintah membahasnya secara maraton bersama komisi-komisi dan Badan Anggaran DPR. Pada 24 September 2026, pemerintah dan Banggar menyepakati asumsi dan postur RUU APBN 2027, termasuk anggaran subsidi energi Rp261,50 triliun dan target konsumsi LPG 8 juta ton. Hasilnya dijadwalkan dibawa ke Rapat Paripurna DPR pada Selasa, 29 September 2026.",
      "Artikel ini ditulis sebelum hasil paripurna dipastikan, jadi status pengesahan perlu dicek di sumber resmi.",
      "## Dampak",
      "APBN menentukan besaran subsidi, layanan publik, pendidikan, dan kesehatan yang dirasakan masyarakat. Anggaran subsidi energi, misalnya, memengaruhi harga BBM dan LPG yang dipakai rumah tangga dan pelaku usaha kecil.",
      "Di sisi lain, sejumlah pakar, seperti pakar hukum tata negara Bivitri Susanti, mengkritik lemahnya pengawasan DPR karena dominasi koalisi pemerintah. Publik berhak mengawasi agar anggaran tepat sasaran.",
      "## Pandangan Islam",
      "Islam memerintahkan penunaian amanah kepada yang berhak dan penetapan hukum dengan adil (QS. An-Nisa': 58). Urusan bersama dianjurkan diputuskan dengan musyawarah (QS. Asy-Syura: 38). Dalam kaidah fikih, kebijakan pemimpin atas rakyat harus terkait dengan kemaslahatan.",
      "Karena itu anggaran negara adalah amanah yang wajib dijaga dari pemborosan dan penyelewengan; penyalahgunaan harta publik dicela keras (QS. Ali 'Imran: 161).",
      "<em>Catatan: pandangan Islam di atas adalah prinsip umum, bukan fatwa. Untuk persoalan hukum yang rinci, tanyakan kepada ulama atau lembaga fatwa yang terpercaya.</em>",
    ],
    sumber: [
      {nama: "CNBC Indonesia — Jelang Rapat Paripurna, Bocoran Subsidi BBM di RAPBN 2027", url: "https://cnbcindonesia.com/news/20260928170522-4-771535/jelang-rapat-paripurna-besok-ini-bocoran-subsidi-bbm-cs-di-rapbn-2027", tanggal: "28 September 2026"},
      {nama: "JakartaSatu — Pakar: DPR Kini Jadi Perpanjangan Tangan Pemerintah", url: "https://jakartasatu.com/2026/09/25/pakar-dpr-kini-jadi-perpanjangan-tangan-pemerintah/", tanggal: "25 September 2026"},
    ],
  },
  {
    id: "adab-menjelang-maghrib",
    kategori: "Akhlak",
    judul: "Adab Menjelang Waktu Maghrib",
    tanggal: "22 September 2026",
    ringkasan:
      "Beberapa amalan dan adab yang dianjurkan ketika matahari mulai terbenam, sebelum masuk waktu Maghrib.",
    waktuBaca: "3 menit",
    isi: [
      "Waktu menjelang Maghrib adalah salah satu momen yang dianjurkan untuk memperbanyak dzikir dan doa. Sebagian ulama menyebutnya sebagai salah satu waktu mustajab untuk berdoa, khususnya menjelang berbukanya hari.",
      "Di antara adab yang dianjurkan: menyegerakan diri menuju tempat shalat, memperbanyak istighfar, serta menahan diri dari aktivitas yang melalaikan pada waktu tersebut.",
      "Rasulullah ﷺ juga mengajarkan agar anak-anak dan anggota keluarga ditahan di rumah menjelang Maghrib, karena pada waktu ini setan-setan bertebaran, sebagaimana disebutkan dalam beberapa riwayat hadits.",
      "Menutup hari dengan dzikir petang dan mempersiapkan diri menyambut Maghrib dengan tenang adalah bagian dari menjaga kualitas ibadah harian.",
    ],
  },
  {
    id: "keutamaan-istighfar",
    kategori: "Fiqih",
    judul: "Keutamaan Istighfar dalam Kehidupan Sehari-hari",
    tanggal: "21 September 2026",
    ringkasan:
      "Istighfar bukan hanya permohonan ampun, tetapi juga pembuka pintu rezeki dan ketenangan hati.",
    waktuBaca: "4 menit",
    isi: [
      "Istighfar (permohonan ampun kepada Allah) adalah salah satu amalan ringan yang memiliki keutamaan besar. Al-Qur'an menyebutkan bahwa istighfar dapat membuka pintu rezeki, menurunkan hujan, dan menambah kekuatan.",
      "Nabi Muhammad ﷺ sendiri, meski maksum, senantiasa beristighfar setiap hari tidak kurang dari 70-100 kali, sebagaimana disebutkan dalam hadits riwayat Bukhari.",
      "Membiasakan istighfar di sela-sela aktivitas — saat menunggu, saat perjalanan, atau sebelum tidur — dapat menjadi cara sederhana menjaga kedekatan dengan Allah di tengah kesibukan.",
    ],
  },
  {
    id: "menjaga-shalat-berjamaah",
    kategori: "Fiqih",
    judul: "Menjaga Semangat Shalat Berjamaah di Tengah Kesibukan",
    tanggal: "20 September 2026",
    ringkasan:
      "Tips praktis agar tetap bisa shalat berjamaah di masjid meski jadwal kerja padat.",
    waktuBaca: "3 menit",
    isi: [
      "Shalat berjamaah memiliki keutamaan 27 derajat dibanding shalat sendirian. Namun bagi pekerja dengan jadwal padat, menjaga kebiasaan ini butuh perencanaan.",
      "Beberapa tips: kenali lokasi masjid/mushola terdekat dari kantor, atur waktu istirahat menyesuaikan waktu shalat, dan komunikasikan kebutuhan ini kepada atasan/rekan kerja secara baik.",
      "Jika benar-benar tidak memungkinkan berjamaah di masjid, berjamaah bersama rekan kerja di ruang kantor juga tetap mendapatkan keutamaan jamaah, meski pahalanya berbeda dengan di masjid.",
    ],
  },
  {
    id: "kisah-sabar-nabi-ayyub",
    kategori: "Sirah",
    judul: "Kisah Kesabaran Nabi Ayyub 'Alaihissalam",
    tanggal: "19 September 2026",
    ringkasan:
      "Pelajaran tentang kesabaran menghadapi ujian dari kisah Nabi Ayyub yang diuji dengan sakit bertahun-tahun.",
    waktuBaca: "5 menit",
    isi: [
      "Nabi Ayyub AS dikenal sebagai teladan kesabaran dalam menghadapi ujian. Beliau diuji dengan kehilangan harta, keluarga, dan penyakit yang berkepanjangan, namun tetap teguh bersyukur kepada Allah.",
      "Al-Qur'an mengabadikan doa beliau dalam Surat Al-Anbiya ayat 83: 'Sesungguhnya aku telah ditimpa penyakit, dan Engkau adalah Tuhan Yang Maha Penyayang di antara para penyayang.'",
      "Kisah ini mengajarkan bahwa ujian bukanlah tanda kemurkaan Allah, melainkan bisa menjadi jalan peningkatan derajat bagi hamba yang sabar dan tetap husnuzhan kepada-Nya.",
    ],
  },
  {
    id: "tafsir-ayat-kursi",
    kategori: "Tafsir",
    judul: "Mengenal Keagungan Ayat Kursi",
    tanggal: "18 September 2026",
    ringkasan:
      "Ayat Kursi disebut sebagai ayat paling agung dalam Al-Qur'an. Berikut kandungan singkatnya.",
    waktuBaca: "4 menit",
    isi: [
      "Ayat Kursi (QS. Al-Baqarah: 255) dikenal sebagai ayat yang paling agung dalam Al-Qur'an, sebagaimana disabdakan Rasulullah ﷺ dalam hadits riwayat Muslim.",
      "Ayat ini menjelaskan tentang keesaan, kekuasaan, dan keluasan ilmu Allah yang meliputi langit dan bumi, tanpa ada yang mampu memberi syafaat di sisi-Nya kecuali dengan izin-Nya.",
      "Dianjurkan membaca Ayat Kursi setelah shalat fardhu dan sebelum tidur, sebagai bentuk perlindungan dan pengingat akan kebesaran Allah dalam keseharian.",
    ],
  },
  {
    id: "hikmah-menuntut-ilmu",
    kategori: "Hikmah",
    judul: "Hikmah di Balik Perintah Menuntut Ilmu",
    tanggal: "17 September 2026",
    ringkasan:
      "Islam menempatkan ilmu sebagai jalan menuju keimanan yang kokoh dan amal yang benar.",
    waktuBaca: "3 menit",
    isi: [
      "Wahyu pertama yang turun kepada Rasulullah ﷺ adalah perintah membaca (Iqra'), menunjukkan betapa Islam sangat menekankan pentingnya ilmu sejak awal.",
      "Ilmu menjadi landasan agar ibadah dan muamalah seorang Muslim dilakukan dengan benar, bukan sekadar ikut-ikutan tanpa pemahaman.",
      "Menuntut ilmu tidak terbatas pada bangku sekolah — membaca artikel keislaman, mengikuti kajian, atau bertanya kepada yang lebih paham juga bagian dari menuntut ilmu yang bernilai ibadah.",
    ],
  },
];
