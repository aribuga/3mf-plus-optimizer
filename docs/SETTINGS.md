# 3MF+Optimizer — Ayar Rehberi

Bu doküman, 3MF+Optimizer içindeki presetleri, micron sistemini, support profillerini ve fuzzy/texture ayarlarını açıklar. Amaç, Bambu Studio `.3mf` dosyasında hangi ayarın neyi değiştirdiğini hızlıca anlayıp bilinçli preset seçebilmek.

> Kısa kullanım: `.3mf` yükle → preset seç → micron seç → support/texture override gerekiyorsa seç → **Analyze & optimize** → raporu kontrol et → yeni `.3mf` indir → Bambu Studio’da açıp yeniden slice et.

---

## 1. Temel mantık

3MF+Optimizer, Bambu Studio `.3mf` projesini tarayıcıda açar ve proje içindeki process/config alanlarını günceller. Dosya sunucuya yüklenmez.

Uygulama üç şeyi birlikte yapmaya çalışır:

1. **Ayar değerlerini değiştirir.**  
   Örneğin `wall_loops`, `layer_height`, `support_top_z_distance`, `fuzzy_skin_thickness`.

2. **Bambu Studio’nun proje override listesiyle senkron tutar.**  
   Bambu Studio bazı ayarları ancak `different_settings_to_system` listesinde görünüyorsa aktif proje ayarı gibi okuyabilir.

3. **Riskli cloud/printer alanlarını korumaya çalışır.**  
   Cloud Strict açıkken machine/printer/host/filament manifest override’ları mümkün olduğunca temizlenir veya eklenmez.

---

## 2. Önerilen genel akış

### Bambu Studio içinde

Optimize edilmiş dosyayı açtıktan sonra mutlaka:

1. **Prepare** ekranında ayarları kontrol et.
2. **Preview → Slice plate** yap.
3. Eski preview/cache görüntülerine güvenme.
4. Printer seçimi veya cloud bağlantısı garipse dosyayı kapatıp orijinal temiz `.3mf` üzerinden tekrar optimize et.

### En güvenli kombinasyon

```txt
Cloud Strict: On
Preset: ihtiyaca göre
Micron: 120 veya 160
Support Mode: Keep veya Tree Slim
Support Profile: Profile Default / Easy Remove / Yasin Support
Texture Override: Profile Default veya Keep Existing
```

---

## 3. Micron / Layer Height sistemi

Micron seçimi sadece `layer_height` değildir. Layer height değişince bazı hızlar, support mesafeleri, top/bottom shell katman sayıları ve texture yoğunluğu da değişmelidir.

| Micron | Layer height | Kullanım | Not |
|---:|---:|---|---|
| 80 micron | 0.08 mm | Ultra detay / küçük obje | Çok uzun sürer; support ve fuzzy daha hassas olmalı. |
| 120 micron | 0.12 mm | Ana kalite profili | Lamba başlığı ve görsel parçalar için default öneri. |
| 160 micron | 0.16 mm | Üretim / hız-kalite dengesi | Fuzzy skin kullanılıyorsa gayet mantıklı. |
| 200 micron | 0.20 mm | Hızlı prototip | Küre/organik yüzeyde layer basamağı daha görünür. |

### Micron değişince sabit kalması gerekenler

Özellikle 0.4 nozzle ve 0.88 mm et kalınlığı hedefinde şunlar genelde sabit kalır:

```txt
Nozzle: 0.4 mm
Default line width: 0.42 mm
Outer wall line width: 0.42 mm
Inner wall line width: 0.46 mm
Wall loops: 2
```

Sebep:

```txt
0.42 outer + 0.46 inner ≈ 0.88 mm
```

Layer height değişse de kabuk kalınlığı hedefi değişmez.

### Micron değişince adapte edilen ayarlar

```txt
layer_height
initial_layer_print_height
top_shell_layers
bottom_shell_layers
outer_wall_speed
inner_wall_speed
small_perimeter_speed
overhang_wall_speed
bridge_speed
minimum_layer_time
support_top_z_distance
support_bottom_z_distance
support_interface_spacing
fuzzy_skin_thickness
fuzzy_skin_point_distance
```

---

## 4. Presetler

### 4.1 Yasin Aribuga Spec

Bu preset, `Tendril_base_v4.3mf` içinde sevilen 0.12 mm ayar karakterini baz alır. Özellikle support ve fuzzy dokusu kritiktir.

**Karakter:** agresif doku, organik yüzey, güçlü support setup, 0.12 mm kalite.

Temel ayarlar:

```txt
Layer height: 0.12
Wall loops: 3
Line width: 0.42
Sparse infill: 18%
Infill pattern: gyroid
Fuzzy skin: external / contour
Fuzzy thickness: 0.22
Fuzzy point distance: 0.30
Outer wall speed: 80
Inner wall speed: 350
Top surface speed: 200
Overhang speeds: 60 / 30 / 10 / 10 / 10
```

Support ayarları:

```txt
Enable support: on
Support type: tree(auto)
Support style: tree_hybrid
Threshold angle: 55
Build plate only: on
Top Z distance: 0.24
Bottom Z distance: 0.12
Interface top layers: 4
Interface bottom layers: 2
Interface pattern: rectilinear
Interface spacing: 0.5
Tree branch angle: 45
Tree branch diameter: 2
Tree branch distance: 5
Tree wall count: -1
```

**Ne zaman kullanılır?**

- Tendril / organik yüzey işleri
- Dokulu heykelsi baskılar
- Support davranışı daha önce denenmiş dosyaya benzesin istendiğinde

**Dikkat:** Yasin Spec texture `0.22 / 0.30` değerini bilinçli olarak korur. Bu hafif fuzzy değil, güçlü kabuk/kayalık doku ayarıdır.

---

### 4.2 Lamp Shade Fuzzy 0.88

0.88 mm et kalınlığı olan küre/lamba başlığı gibi ince kabuklar için.

**Karakter:** iki duvarlı ince kabuk, 0 infill, random seam, dış yüzeyde fuzzy.

120 micron önerisi:

```txt
Layer height: 0.12
Wall loops: 2
Default line width: 0.42
Outer wall line width: 0.42
Inner wall line width: 0.46
Sparse infill density: 0%
Top shell layers: 0 veya 1
Bottom shell layers: 1
Seam position: random
Fuzzy skin: outside / contour
Fuzzy thickness: 0.10
Fuzzy point distance: 0.60
Outer wall speed: 45–60
Inner wall speed: 60
Small perimeter speed: 20–25
Overhang speeds: 60 / 50 / 35 / 25 / 20
Minimum layer time: 10–12 sec
```

**Neden 2 wall?**

0.88 mm kabuğu 0.4 nozzle ile temiz doldurmak için:

```txt
0.42 + 0.46 = 0.88
```

3 wall loop, bu kalınlıkta slicer’ı sıkıştırıp yüzeyde dalgalanma ve fazla extrusion hissi yaratabilir.

**Üst ağız/rim notu:**  
Fuzzy skin açık ağız çizgisini tırtıklı yapabilir. En iyi çözüm, Bambu Studio’da son 5–10 mm için modifier ekleyip o bölgede fuzzy kapatmaktır.

---

### 4.3 Sand & Paint Prep

Zımpara, astar ve boya yapılacak parçalar için.

**Karakter:** fuzzy kapalı, daha tok kabuk, daha yavaş dış duvar, daha iyi zımpara payı.

120 micron önerisi:

```txt
Fuzzy skin: off
Layer height: 0.12
Wall loops: 4
Line width: 0.42
Outer wall speed: 40
Inner wall speed: 80
Top surface speed: 50
Sparse infill density: 10%
Infill pattern: gyroid
Top shell layers: 5
Bottom shell layers: 4
Seam position: back / aligned
Ironing: off
```

**Ne zaman kullanılır?**

- Boyanacak obje
- Dolgu astarı + zımpara yapılacak yüzey
- Fuzzy değil, pürüzsüz bitiş istenen ürün

**Not:** Boya öncesi yüzey için en önemli şey yalnızca layer height değil; seam kontrolü, duvar sayısı ve top/bottom shell kalınlığıdır.

---

### 4.4 Fine Balanced

Genel amaçlı kaliteli baskı.

```txt
Layer height: micron seçimine göre
Line width: 0.42
Wall loops: 3
Infill: 15% gyroid
Outer wall speed: orta
Top surface speed: orta-düşük
Support: kullanıcı seçimine göre
```

**Ne zaman kullanılır?** çoğu obje için güvenli başlangıç.

---

### 4.5 Visual Polish

Görsel yüzey öncelikli baskı.

```txt
Outer wall speed: düşük-orta
Top surface speed: düşük
Wall loops: 3
Infill: 10–15%
Ironing: opsiyonel
Seam: aligned/back
```

**Ne zaman kullanılır?** vitrin objesi, pürüzsüz görünen dış yüzey, boyasız kullanılacak model.

---

### 4.6 Functional Strength

Daha rijit ve dayanıklı parça.

```txt
Wall loops: 4+
Infill: 25–35%
Pattern: gyroid/cubic
Top/bottom shell: daha yüksek
Fuzzy: kapalı
Outer wall speed: orta
```

**Ne zaman kullanılır?** taşıyıcı parça, bağlantı parçası, vida/pin/slot içeren parçalar.

---

### 4.7 Organic / Thin Wall

Organik, heykelsi veya ince yüzeyli modeller için.

```txt
Wall generator: Arachne tercih edilir
Wall loops: 2–3
Infill: düşük veya 0
Outer wall speed: orta-düşük
Overhang speeds: kademeli yavaş
Fuzzy: opsiyonel
```

**Ne zaman kullanılır?** heykel, lamba, organik yüzey, ince form.

---

### 4.8 Support Master

Support temizliği öncelikli profil.

```txt
Support: tree veya snug
Support interface: açık
Top Z distance: profile göre ayarlı
XY distance: dengeli
Threshold angle: orta
```

**Ne zaman kullanılır?** alt yüzey/support izleri kritikse.

---

### 4.9 Fast Draft

Hızlı test/prototip.

```txt
Layer height: 0.16 veya 0.20
Wall loops: 2
Infill: düşük
Outer wall speed: daha yüksek
Top surface speed: yüksek
Support: minimum
```

**Ne zaman kullanılır?** form testi, ölçü testi, hızlı iterasyon.

---

### 4.10 Mini Detail

Küçük detay, yazı, minyatür parça.

```txt
Layer height: 0.08 veya 0.12
Outer wall speed: düşük
Small perimeter speed: düşük
Minimum layer time: yüksek
Line width: 0.40–0.42
```

**Ne zaman kullanılır?** küçük figür, yazı, ince çıkıntı, logo.

---

### 4.11 Vase / Lamp Shell

Tek duvar / spiral vase mantığı.

```txt
Wall loops: 1
Infill: 0%
Top shell: 0
Seam: yok veya minimum
Line width: 0.50–0.62 civarı denenebilir
```

**Dikkat:** 0.88 mm et kalınlığı hedefi için ideal değildir. Tek duvar daha pürüzsüz olabilir ama daha esnek/kırılgan olur.

---

## 5. Support Lab

Support sistemi iki parçadan oluşur:

1. **Support Mode / Support motoru**  
   Support’un açık/kapalı mı, tree mi, snug mı olduğunu belirler.

2. **Support Profile / Support profili**  
   Support’un modele ne kadar yakın duracağını, interface davranışını ve sökülme/zımpara izini belirler.

### 5.1 Support Mode seçenekleri

| Seçenek | Ne yapar | Ne zaman kullanılır? |
|---|---|---|
| Keep existing | Dosyadaki support motorunu korur | Projede özel support varsa |
| Off | Support kapatır | Model supportsuz basılabiliyorsa |
| Tree Slim | Tree support açar, daha az temas hedefler | Organik/lamba/heykel formlar |
| Normal / Snug | Daha klasik support yaklaşımı | Alt yüzeyin daha düzgün olması gerekiyorsa |

### 5.2 Support Profile seçenekleri

| Profil | Karakter | Artı | Eksi |
|---|---|---|---|
| Profile Default | Preset ne diyorsa onu bırakır | En güvenli | Özel problem çözmez |
| Easy Remove | Support biraz daha ayrı | Kolay çıkar, az iz | Alt yüzey daha az temiz olabilir |
| Balanced Tree | Orta mesafe | Dengeli | Ekstra kusursuz değil |
| Close Contact | Support daha yakın | Alt yüzey daha iyi | Daha zor çıkar, iz riski |
| Max Separation | Support en uzak | İz azaltma | Sarkma/alt kalite riski |
| Yasin Support | Tendril_base_v4 support | Denenmiş organik ayar | Her model için değil |

### 5.3 Top Z Distance nedir?

`support_top_z_distance`, support ile model arasında Z yönünde bırakılan boşluktur.

- **Artarsa:** support daha kolay çıkar, iz azalır; ama alt yüzey daha sarkık olabilir.
- **Azalırsa:** alt yüzey daha temiz olur; ama support daha zor çıkar ve iz bırakabilir.

Yasin Support içinde:

```txt
support_top_z_distance: 0.24
support_bottom_z_distance: 0.12
```

Bu, destekleri biraz ayrı tutup iz azaltmaya yönelik bilinçli bir seçimdir.

### 5.4 Interface layer nedir?

Support interface, support ile model arasında daha düzenli temas katmanı üretir.

- Daha çok interface layer: alt yüzey daha düzenli olabilir, support zorlaşabilir.
- Daha az interface layer: support kolay çıkar, alt yüzey daha kaba olabilir.

Yasin Support:

```txt
support_interface_top_layers: 4
support_interface_bottom_layers: 2
support_interface_pattern: rectilinear
support_interface_spacing: 0.5
```

---

## 6. Texture / Fuzzy Override

Fuzzy skin, dış yüzeyde kontrollü rastgele nozzle hareketiyle dokulu yüzey üretir. Bu özellikle organik obje, lamba başlığı ve taş/kabuk hissi için iyi çalışır.

### 6.1 Seçenekler

| Seçenek | Davranış |
|---|---|
| Profile Default | Seçili preset’in texture ayarını kullanır |
| Keep Existing | Dosyadaki fuzzy ayarlarına hiç dokunmaz |
| Fuzzy Off | Fuzzy skin’i kapatır |
| Subtle Texture | Hafif doku |
| Balanced Texture | Orta doku |
| Strong Texture | Belirgin doku |
| Yasin Spec Texture | `0.22 / 0.30`, sabit ve güçlü doku |
| Yasin Lite Texture | Lamba başlığı için daha kontrollü Yasin hissi |

### 6.2 120 micron değerleri

| Texture | Thickness | Point distance | Karakter |
|---|---:|---:|---|
| Subtle | 0.08 | 0.80 | Hafif kumlu yüzey |
| Balanced | 0.10 | 0.60 | Dengeli görünür texture |
| Strong | 0.14 | 0.45 | Belirgin doku |
| Yasin Spec | 0.22 | 0.30 | Çok yoğun organik/kabuk doku |
| Yasin Lite | 0.10 | 0.60 | İnce lamba gövdesi için güvenli |

### 6.3 Thickness ne yapar?

`fuzzy_skin_thickness`, nozzle’ın yüzeyden ne kadar sapacağını belirler.

- Artarsa: yüzey daha pütürlü/organik olur.
- Azalırsa: doku daha nazik olur.

### 6.4 Point distance ne yapar?

`fuzzy_skin_point_distance`, fuzzy noktaları arasındaki mesafeyi belirler.

- Azalırsa: doku sıklaşır, baskı süresi ve nozzle hareketi artar.
- Artarsa: doku daha seyrek ve yumuşak olur.

### 6.5 Rim / açık ağız uyarısı

Fuzzy skin açık ağız çizgilerini tırtıklı yapabilir. Lamba başlığı gibi üstü açık formlarda ideal yöntem:

```txt
Gövde: fuzzy açık
Üst son 5–10 mm rim: fuzzy kapalı
```

Bunu Bambu Studio’da modifier ile yapmak gerekir. 3MF+Optimizer otomatik geometri modifier’ı eklemez.

---

## 7. Cloud Strict

Cloud Strict, Bambu Studio’da account/printer bağlantısını bozabilecek riskli alanlara dokunmamaya çalışır.

Açıkken:

```txt
machine override yazılmaz veya temizlenir
host_type / printhost_* manifestten çıkarılır
printer_variant / nozzle_diameter manifestte aktif override yapılmaz
filament_* ve sıcaklık/fan gibi cloud-riskli alanlar mümkün olduğunca manifestte aktif edilmez
```

**Ne zaman açık olmalı?**  
Neredeyse her zaman. Özellikle Bambu Studio’dan doğrudan printer’a göndereceksen açık tut.

**Ne zaman kapatılır?**  
Sadece local/custom profile ile çalıştığını biliyorsan ve printer/cloud bağlantısı önemsizse.

---

## 8. Malzeme davranışı

Malzeme seçimi, bazı guardrail ayarları için kullanılır. Ama Cloud Strict açıkken filament/printer riskli alanları mümkün olduğunca aktif override yapılmaz.

### PLA / PLA+

- Fan yüksek olabilir.
- 0.12–0.16 layer ideal.
- Fuzzy + random seam iyi çalışır.
- Üst daralan bölgelerde minimum layer time önemli.

### PETG

- Support daha zor çıkar.
- Top Z distance PLA’ya göre biraz daha rahat tutulabilir.
- Fan ve hız ayarlarında aşırı agresif olmamak gerekir.

### TPU

- Daha düşük hızlar gerekir.
- Retraction/stringing daha kritik olur.
- Support temizliği daha zor olabilir.

### ABS / ASA

- Soğutma daha kontrollü olmalı.
- Warping riski nedeniyle brim/chamber önemli olabilir.
- Cloud Strict açıkken sıcaklık/fan override beklenmemelidir.

---

## 9. Ayar sözlüğü

### `layer_height`

Katman yüksekliği. Düşük değer daha pürüzsüz eğri ve daha uzun süre demektir.

### `initial_layer_print_height`

İlk katmanın yüksekliği. Genelde 0.20 mm güvenli bir başlangıçtır. İlk katmanın plate’e tutunmasını destekler.

### `line_width`

Genel çizgi genişliği. 0.4 nozzle için 0.42 mm güvenli ve dengeli bir değerdir.

### `outer_wall_line_width`

Dış duvar çizgi genişliği. Görsel yüzeyi etkiler. İnce yüzeylerde fazla geniş değer şişkinlik yaratabilir.

### `inner_wall_line_width`

İç duvar çizgi genişliği. 0.88 mm kabukta 0.46 mm kullanmak iki duvarla hedef kalınlığı tamamlar.

### `wall_loops`

Duvar sayısı. Daha çok duvar daha güçlü parça demektir ama ince kabukta slicer sıkışabilir.

### `sparse_infill_density`

Dolgu oranı. Lamba başlığı gibi gerçek kabuk modellerde 0% kullanılabilir.

### `sparse_infill_pattern`

Dolgu deseni. Gyroid, genel kullanımda dengeli ve kesişim kaynaklı birikimi daha az olan güvenli seçenektir.

### `top_shell_layers`

Üst kapak katman sayısı. Üstü açık lamba başlığında genelde 0 veya 1 yeterlidir. Kapalı/solid yüzeylerde artırılır.

### `bottom_shell_layers`

Alt kapak katman sayısı. Plate’e oturan yüzeyde 1–4 arası kullanılır; boya/zımpara için daha yüksek olabilir.

### `seam_position`

Duvar başlangıç/bitiş izinin konumu. Pürüzsüz yüzeyde aligned/back iyi olabilir; fuzzy skin’de random seam doku içinde kaybolabilir.

### `outer_wall_speed`

Dış duvar basma hızı. Görsel kaliteyi en çok etkileyen hızlardan biridir. Fuzzy yüzeyde çok yüksek hız titreşimli görünüm yaratabilir.

### `inner_wall_speed`

İç duvar hızı. Görsel yüzeyi daha az etkiler; daha yüksek olabilir.

### `small_perimeter_speed`

Küçük çaplı halkalar ve küçük duvar bölgeleri için hız. Üst daralan kürelerde çok önemlidir.

### `top_surface_speed`

Üst solid yüzey hızı. Yan duvarı doğrudan etkilemez. Top shell yoksa etkisi azdır.

### `overhang_wall_speed`

Overhang seviyesine göre duvar hızları. Genelde 5 kademeli olabilir. Yüzdeler hız yüzdesi değil, overhang şiddetidir.

Örnek:

```txt
10% overhang: 60
25% overhang: 50
50% overhang: 35
75% overhang: 25
100% overhang: 20
```

### `support_type`

Support algoritması. Örneğin `tree(auto)`.

### `support_style`

Support stili. Geçerli Bambu değerlerine dikkat edilmelidir. `slim` tek başına hatalı olabilir; Tree Slim için doğru değer `tree_slim` olmalıdır. Yasin Support içinde `tree_hybrid` kullanılır.

### `support_top_z_distance`

Support’un modele üstten ne kadar uzak durduğu. İz/sökülme dengesinde en kritik ayarlardan biridir.

### `support_object_xy_distance`

Support ile model arasındaki yatay mesafe. Artarsa destek daha az iz bırakır ama bazı çıkıntılarda kalite düşebilir.

### `support_interface_top_layers`

Support ile model arasında üst interface katman sayısı. Alt yüzey kalitesini artırabilir ama sökülmeyi zorlaştırabilir.

### `fuzzy_skin_thickness`

Fuzzy dokunun dışarı sapma miktarı. Büyük değer daha agresif doku.

### `fuzzy_skin_point_distance`

Fuzzy noktaları arasındaki mesafe. Küçük değer daha sık doku.

### `ironing`

Üst solid yüzeyi düzleştirme işlemi. Lamba yan yüzeyi veya fuzzy yüzey için genelde gerekli değildir; boya/zımpara öncesi kapalı kalması daha güvenli olabilir.

---

## 10. Sık problemler

### Bambu Studio’da ayarlar görünmüyor

- Dosyayı eski açık sekmeden değil güncel HTML’den optimize et.
- Orijinal temiz `.3mf` ile dene.
- Analyze sonrası fark tablosunda değişiklik olduğundan emin ol.
- Bambu Studio’da açtıktan sonra yeniden slice et.

### Support style hatası çıkıyor

`support_style: slim` geçerli olmayabilir. Güncel build bu değeri `tree_slim` olarak düzeltir veya riskli değeri engeller.

### Bambu account/printer bağlantısı garip davranıyor

Cloud Strict açık olsun. Eski optimize edilmiş dosyadan değil, orijinal dosyadan yeniden optimize et.

### Üst açık rim tırtıklı oluyor

Sebep çoğu zaman fuzzy skin’in açık ağız çizgisinde çalışmasıdır. Çözüm:

```txt
Bambu Studio modifier ile üst 5–10 mm’de fuzzy kapat
```

### Üst daralan bölgede dalgalanma oluyor

Şunları dene:

```txt
Minimum layer time: 10–12 sec
Small perimeter speed: 20–25
Overhang speeds: daha yavaş
Nozzle sıcaklığı: 5°C düşür
Aynı anda 2 adet model bas
```

### Top surface speed’i düşürdüm ama yan yüzey düzelmedi

Top surface speed yan duvarı değil, üst solid yüzeyleri etkiler. Küre yan yüzeyi için outer wall, overhang, small perimeter ve cooling daha önemlidir.

---

## 11. Yasin’in lamba başlığı için önerilen iki ana kombinasyon

### Kalite

```txt
Preset: Lamp Shade Fuzzy 0.88
Micron: 120
Texture: Balanced veya Yasin Lite
Support: Easy Remove / Balanced Tree
Cloud Strict: On
```

### Tendril karakteri / agresif doku

```txt
Preset: Yasin Aribuga Spec
Micron: 120
Texture: Profile Default veya Yasin Spec Texture
Support: Yasin Support
Cloud Strict: On
```

### Üretim / hızlı ama iyi

```txt
Preset: Lamp Shade Fuzzy 0.88
Micron: 160
Texture: Balanced veya Yasin Lite
Support: Easy Remove
Cloud Strict: On
```

---

## 12. Geliştirici notu

Bu araç gerçek slicer değildir. Geometri, overhang, bridge, nozzle path ve baskı süresi gibi sonuçlar Bambu Studio’nun yeniden slice etmesiyle doğrulanmalıdır. En güçlü gelecek adım, Bambu Studio CLI ile server-side veya local companion üzerinden gerçek slice/export akışı kurmaktır.
