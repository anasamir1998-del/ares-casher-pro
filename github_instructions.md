# خطوات رفع المشروع على GitHub وتشغيل الرابط

لقد قمت بتجهيز المشروع محلياً وعمل أول commit. الآن اتبع هذه الخطوات البسيطة:

### الخطوة 1: إنشاء مستودع (Repository) على GitHub
1. اذهب إلى [github.com/new](https://github.com/new).
2. اختر اسماً للمشروع (مثلاً: `ares-casher-pro`).
3. اترك باقي الإعدادات كما هي واضغط **Create repository**.

### الخطوة 2: ربط جهازك بـ GitHub
افتح الـ Terminal (PowerShell) وانسخ الأوامر التالية (استبدل الرابط برابط المستودع الخاص بك):

```powershell
# استبدل USERNAME و REPO باسم المستخدم واسم المشروع الخاص بك
git remote add origin https://github.com/USERNAME/REPO.git
git branch -M main
git push -u origin main
```

*(قد يطلب منك تسجيل الدخول عبر المتصفح، وافق عليه)*

### الخطوة 3: تشغيل الرابط (GitHub Pages)
بعد رفع الكود، قم بتفعيل الرابط ليفتحه الآخرون:
1. في صفحة المشروع على GitHub، اضغط على **Settings**.
2. من القائمة الجانبية، اختر **Pages**.
3. تحت قسم **Build and deployment**، تأكد من اختيار `Deploy from a branch`.
4. اختر فرع `main` واضغط **Save**.
5. انتظر دقيقة، وسيظهر لك رابط في أعلى الصفحة (مثل `https://username.github.io/repo-name/`).

**هذا الرابط هو ما يمكنك إرساله لأي شخص ليفتح المشروع.**
