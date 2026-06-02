"use client";

import { usePathname } from "next/navigation";

export type Locale = "en" | "ar";

const ar: Record<string, string> = {
  "Trade smarter, locally.": "بدل واشتر بذكاء في منطقتك.",
  Company: "الشركة",
  About: "عن المنصة",
  Browse: "تصفح",
  "All rights reserved.": "جميع الحقوق محفوظة.",
  "Designed and built by": "تصميم وبرمجة",
  "Select language": "اختر اللغة",
  Home: "الرئيسية",
  Account: "الحساب",
  Offers: "العروض",
  Messages: "الرسائل",
  "My Listings": "إعلاناتي",
  Favorites: "المفضلة",
  Blog: "المدونة",
  Settings: "الإعدادات",
  Products: "المنتجات",
  Search: "البحث",
  Onboarding: "البداية",
  "Search products, locations, categories...":
    "ابحث عن منتجات أو أماكن أو أقسام...",
  "Create listing": "أضف إعلان",
  "Create Listing": "أضف إعلان",
  "Sign in": "تسجيل الدخول",
  "Sign out": "تسجيل الخروج",
  "Your account": "حسابك",
  "Manage Account": "إدارة الحساب",
  "Light mode": "الوضع الفاتح",
  "Dark mode": "الوضع الداكن",
  Notifications: "الإشعارات",
  "Unread only": "غير المقروء فقط",
  "Mark all as read": "تحديد الكل كمقروء",
  "No New Updates": "لا توجد تحديثات جديدة",
  Filters: "الفلاتر",
  Category: "القسم",
  All: "الكل",
  Location: "الموقع",
  "All cities": "كل المدن",
  "Price range": "نطاق السعر",
  "From EGP": "من جنيه",
  "To EGP": "إلى جنيه",
  "Payment type": "طريقة الدفع",
  Swap: "تبادل",
  Cash: "كاش",
  Condition: "الحالة",
  New: "جديد",
  Used: "مستعمل",
  "Sort by": "الترتيب",
  Newest: "الأحدث",
  "Price low to high": "السعر من الأقل للأعلى",
  "Price high to low": "السعر من الأعلى للأقل",
  "Clear all": "مسح الكل",
  Clear: "مسح",
  Apply: "تطبيق",
  "result(s)": "نتيجة",
  "No Results Found": "لا توجد نتائج",
  "just for you": "مخصص لك",
  "if you don't want to you don't have to":
    "لو مش عايز تسحب، مش لازم",
  "you don't have to keep swipping move to the browse tap and search for what exactly you want":
    "مش لازم تفضل تسحب. انتقل للتصفح وابحث عن الشيء الذي تريده بالضبط.",
  "Featured Deal": "عرض مميز",
  "we're just launched": "لسه مطلقين المنصة",
  "so we may not have too many deals right now but you can go a head and start your own listing and show people what you have to offer":
    "قد لا توجد عروض كثيرة الآن، لكن يمكنك إضافة إعلانك وعرض ما لديك للناس.",
  Featured: "المميز",
  "More For You": "المزيد لك",
  items: "عنصر",
  "Live Swap Deck": "عروض التبادل المباشرة",
  LIKE: "إعجاب",
  DISLIKE: "تخطي",
  Like: "إعجاب",
  Dislike: "تخطي",
  "Sign in to like a product.": "سجل الدخول للإعجاب بمنتج.",
  "Sign in to dislike a product.": "سجل الدخول لتخطي منتج.",
  "Sign in to start swiping.": "سجل الدخول لبدء السحب.",
  "Go to sign in": "اذهب لتسجيل الدخول",
  "Sign in to start swiping. You can still browse listings.":
    "سجل الدخول لبدء السحب. ما زال بإمكانك تصفح الإعلانات.",
  "No other listings yet. Your listings don't appear in the swap deck.":
    "لا توجد إعلانات أخرى بعد. إعلاناتك لا تظهر في كروت التبادل.",
  "You're all caught up - you've swiped everything that matches your filters (your listings are excluded).":
    "انتهيت من كل النتائج المطابقة لفلاترك. تم استبعاد إعلاناتك.",
  "Clear filters": "مسح الفلاتر",
  "Browse listings": "تصفح الإعلانات",
  "Active filters": "الفلاتر النشطة",
  "No listings match your search.": "لا توجد إعلانات تطابق بحثك.",
  "Your listing": "إعلانك",
  Loading: "جاري التحميل",
  "Something went wrong": "حدث خطأ",
  "Failed to swipe": "فشل تنفيذ السحب",
  "You own this listing": "هذا الإعلان ملكك",
  "You cannot contact yourself.": "لا يمكنك التواصل مع نفسك.",
  "Couldn't open chat": "تعذر فتح المحادثة",
  "Failed to start conversation": "فشل بدء المحادثة",
  "Cannot make an offer": "لا يمكن إرسال عرض",
  "You cannot make an offer on your own listing.":
    "لا يمكنك إرسال عرض على إعلانك.",
  "Invalid amount": "قيمة غير صحيحة",
  "Please enter a valid offer amount.": "أدخل قيمة عرض صحيحة.",
  "Offer failed": "فشل إرسال العرض",
  "Failed to submit offer": "فشل إرسال العرض",
  Unauthorized: "غير مصرح",
  "Only the seller can delete this listing.":
    "البائع فقط يمكنه حذف هذا الإعلان.",
  "Listing deleted": "تم حذف الإعلان",
  "Delete failed": "فشل الحذف",
  "Failed to delete listing": "فشل حذف الإعلان",
  Image: "صورة",
  "Verified seller": "بائع موثق",
  "Your safety matters to us!": "سلامتك تهمنا!",
  "Stay safe when meeting buyers and sellers.":
    "حافظ على سلامتك عند مقابلة البائعين والمشترين.",
  "Only meet in public / crowded places for example metro stations and malls.":
    "قابل الطرف الآخر فقط في أماكن عامة ومزدحمة مثل محطات المترو والمولات.",
  "Never go alone to meet a buyer / seller, always take someone with you.":
    "لا تذهب وحدك لمقابلة بائع أو مشتر، اصطحب شخصا معك دائما.",
  "Check and inspect the product properly before purchasing it.":
    "افحص المنتج جيدا قبل الشراء.",
  "Never pay anything in advance or transfer money before inspecting the product.":
    "لا تدفع مقدما ولا تحول مالا قبل فحص المنتج.",
  "Seller Information": "معلومات البائع",
  Seller: "البائع",
  "Edit Listing": "تعديل الإعلان",
  "You are the seller. Buyer actions are hidden.":
    "أنت البائع. تم إخفاء إجراءات المشترين.",
  "Contact Seller": "تواصل مع البائع",
  "Make an Offer": "إرسال عرض",
  "Sign in to contact seller and make offers":
    "سجل الدخول للتواصل مع البائع وإرسال العروض",
  "Edit listing": "تعديل الإعلان",
  "Manage your listing. Deleting will remove it from the marketplace.":
    "أدر إعلانك. الحذف سيزيله من السوق.",
  Cancel: "إلغاء",
  "Deleting...": "جاري الحذف...",
  "Delete listing": "حذف الإعلان",
  "Make an offer": "إرسال عرض",
  "Enter your offer price. You can continue browsing, or submit the offer now.":
    "أدخل سعر عرضك. يمكنك متابعة التصفح أو إرسال العرض الآن.",
  "Offer value": "قيمة العرض",
  "Continue browsing": "متابعة التصفح",
  "Submitting...": "جاري الإرسال...",
  "Make offer": "إرسال العرض",
  "Your offer has been submitted successfully!": "تم إرسال عرضك بنجاح!",
  "Send the seller a message and speed up the process.":
    "أرسل رسالة للبائع لتسريع العملية.",
  "Opening chat...": "جاري فتح المحادثة...",
  "Send message": "إرسال رسالة",
  "Profile Information": "معلومات الملف الشخصي",
  Edit: "تعديل",
  Name: "الاسم",
  "Your name": "اسمك",
  Phone: "الهاتف",
  "Your phone number": "رقم هاتفك",
  "Profile Image": "صورة الملف الشخصي",
  "Saving...": "جاري الحفظ...",
  "Save Changes": "حفظ التغييرات",
  Saved: "تم الحفظ",
  "Profile updated successfully!": "تم تحديث الملف الشخصي بنجاح!",
  "Update failed": "فشل التحديث",
  "Failed to update profile": "فشل تحديث الملف الشخصي",
  "Failed to upload image": "فشل رفع الصورة",
  User: "المستخدم",
  "No name set": "لم يتم تعيين اسم",
  "Not set": "غير محدد",
  "Your latest updates": "آخر تحديثاتك",
  "Profile Settings": "إعدادات الملف الشخصي",
  "Search in offers": "ابحث في العروض",
  "From value (EGP)": "من قيمة (جنيه)",
  "To value (EGP)": "إلى قيمة (جنيه)",
  "All status": "كل الحالات",
  Pending: "قيد الانتظار",
  Accepted: "مقبول",
  Rejected: "مرفوض",
  pending: "قيد الانتظار",
  accepted: "مقبول",
  rejected: "مرفوض",
  "Loading offers...": "جاري تحميل العروض...",
  From: "من",
  Accept: "قبول",
  Reject: "رفض",
  "My Favorites": "المفضلة",
  "Loading favorites...": "جاري تحميل المفضلة...",
  Listings: "إعلانات",
  "No listings yet": "لا توجد إعلانات بعد",
  "Create your first listing to get started.":
    "أضف إعلانك الأول للبدء.",
  "Sign in required": "تسجيل الدخول مطلوب",
  "Please sign in to view your listings.":
    "يرجى تسجيل الدخول لعرض إعلاناتك.",
  "Blog articles and tips will be added here.":
    "ستتم إضافة المقالات والنصائح هنا.",
  "Something went wrong!": "حدث خطأ!",
  "An unexpected error occurred. Please try again.":
    "حدث خطأ غير متوقع. حاول مرة أخرى.",
  "Try again": "حاول مرة أخرى",
  "Page not found": "الصفحة غير موجودة",
  "The page you are looking for does not exist.":
    "الصفحة التي تبحث عنها غير موجودة.",
  "Back home": "العودة للرئيسية",
};

export const categoryTranslations: Record<string, string> = {
  all: "كل الأقسام",
  vehicles: "سيارات ومركبات",
  "real-estate": "عقارات",
  mobiles: "موبايلات وتابلت",
  electronics: "إلكترونيات وأجهزة",
  furniture: "أثاث وديكور",
  fashion: "أزياء وجمال",
  pets: "حيوانات أليفة",
  kids: "أطفال ورضع",
  other: "أخرى",
};

export function getLocaleFromPathname(pathname: string): Locale {
  return pathname.startsWith("/ar") ? "ar" : "en";
}

export function localizePath(pathname: string, locale: Locale) {
  if (/^https?:\/\//.test(pathname) || pathname.startsWith("mailto:")) {
    return pathname;
  }

  const [path, hash = ""] = pathname.split("#");
  const [basePath, query = ""] = path.split("?");
  const withoutLocale = basePath.replace(/^\/ar(?=\/|$)/, "") || "/";
  const nextBase =
    locale === "ar"
      ? withoutLocale === "/"
        ? "/ar"
        : `/ar${withoutLocale}`
      : withoutLocale;

  return `${nextBase}${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`;
}

export function translate(value: string, locale: Locale) {
  if (locale === "en") return value;
  return ar[value] ?? value;
}

export function useLocale() {
  return getLocaleFromPathname(usePathname());
}

export function useT() {
  const locale = useLocale();
  return (value: string) => translate(value, locale);
}

export function useLocalizedPath() {
  const locale = useLocale();
  return (pathname: string) => localizePath(pathname, locale);
}

export function getCategoryName(categoryId: string, locale: Locale) {
  if (locale === "ar") {
    return categoryTranslations[categoryId] ?? categoryTranslations.other;
  }

  return undefined;
}
