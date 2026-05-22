const SAUDI = {
  country: 'SA',
  name: 'المملكة العربية السعودية',
  currency: 'SAR',
  currencySymbol: '﷼',

  documents: {
    iqama: {
      labelAr: 'الإقامة',
      labelEn: 'Iqama (Residence Permit)',
      icon: '🆔',
      renewalPeriodDays: 365,
      gracePeriodDays: 30,
      fineAmount: 500,
      finePerDay: 100,
      fineAfterGrace: true,
      fineDescriptionAr: 'غرامة تأخير تجديد الإقامة: 500 ريال لأول مرة، و 100 ريال عن كل يوم تأخير بعد المهلة',
      fineDescriptionEn: 'Iqama renewal late fee: 500 SAR first time, 100 SAR per day after grace period',
      minRenewalBefore: 90,
      maxRenewalBefore: 14,
      platform: {
        nameAr: 'أبشر',
        nameEn: 'Absher',
        url: 'https://www.absher.sa',
        loginRequired: true,
        app: 'أبشر أفراد',
      },
      stepsAr: [
        'تسجيل الدخول إلى منصة أبشر',
        'اختيار "الخدمات الإلكترونية" → "جوازات السفر"',
        'اختيار "تجديد الإقامة"',
        'تأكيد بيانات صاحب العلاقة',
        'سداد رسوم التجديد عبر سداد أو أون لاين',
        'انتظار إصدار الإقامة الإلكترونية',
      ],
      stepsEn: [
        'Log in to Absher platform',
        'Select "Electronic Services" → "Passports"',
        'Select "Renew Iqama"',
        'Confirm the applicant\'s data',
        'Pay renewal fees via SADAD or online',
        'Wait for electronic Iqama issuance',
      ],
      requiredDocumentsAr: ['صورة من الإقامة الحالية', 'صورة من جواز السفر', 'صورة شخصية', 'تأمين صحي ساري'],
      requiredDocumentsEn: ['Copy of current Iqama', 'Copy of passport', 'Personal photo', 'Valid health insurance'],
      feesAr: 'رسوم التجديد: 650 ريال سنوياً (تشمل رسوم الإصدار والتأمين الصحي)',
      feesEn: 'Renewal fee: 650 SAR per year (includes issuance and health insurance)',
      fines: [
        { reasonAr: 'تأخير التجديد بعد المهلة', reasonEn: 'Late renewal after grace period', amountFn: (days) => 500 + Math.max(0, days - 30) * 100 },
        { reasonAr: 'عدم وجود تأمين صحي', reasonEn: 'No health insurance', amount: 1000 },
        { reasonAr: 'العمل لدى غير الكفيل', reasonEn: 'Working for non-sponsor', amount: 10000 },
      ],
      tipsAr: ['جدد قبل انتهاء الإقامة بـ 90 يوم', 'تأكد من سريان التأمين الصحي', 'لا تعمل لدى غير كفيلك'],
      tipsEn: ['Renew 90 days before expiry', 'Ensure health insurance is valid', 'Do not work for non-sponsor'],
      autoFillFields: ['fullName', 'iqamaNumber', 'nationality', 'sponsorName', 'sponsorId', 'issueDate', 'expiryDate'],
    },

    driving_license: {
      labelAr: 'رخصة القيادة',
      labelEn: 'Driving License',
      icon: '🚗',
      renewalPeriodDays: 365,
      gracePeriodDays: 60,
      fineAmount: 100,
      finePerDay: null,
      fineAfterGrace: true,
      fineDescriptionAr: 'غرامة تأخير تجديد رخصة القيادة: 100 ريال',
      fineDescriptionEn: 'Driving license renewal late fee: 100 SAR',
      minRenewalBefore: 180,
      maxRenewalBefore: 1,
      platform: {
        nameAr: 'أبشر',
        nameEn: 'Absher',
        url: 'https://www.absher.sa',
        loginRequired: true,
        app: 'أبشر أفراد',
      },
      stepsAr: [
        'تسجيل الدخول إلى أبشر',
        'اختيار "الخدمات الإلكترونية" → "المرور"',
        'اختيار "تجديد رخصة القيادة"',
        'تأكيد البيانات الشخصية وعنوان الإقامة',
        'سداد الرسوم',
        'استلام الرخصة الإلكترونية',
      ],
      stepsEn: [
        'Log in to Absher',
        'Select "Electronic Services" → "Traffic"',
        'Select "Renew Driving License"',
        'Confirm personal data and address',
        'Pay fees',
        'Receive electronic license',
      ],
      requiredDocumentsAr: ['صورة من رخصة القيادة الحالية', 'صورة شخصية', 'فحص طبي (إذا مضى على الرخصة أكثر من 3 سنوات)'],
      requiredDocumentsEn: ['Copy of current driving license', 'Personal photo', 'Medical exam (if license is older than 3 years)'],
      feesAr: 'رسوم التجديد: 40 ريال سنوياً (لكل سنة)',
      feesEn: 'Renewal fee: 40 SAR per year',
      fines: [
        { reasonAr: 'تأخير التجديد', reasonEn: 'Late renewal', amount: 100 },
        { reasonAr: 'القيادة بدون رخصة سارية', reasonEn: 'Driving without valid license', amount: 900 },
      ],
      tipsAr: ['جدد رخصتك قبل انتهائها', 'إذا مضى أكثر من 3 سنوات على الرخصة، احجز فحص طبي أولاً'],
      tipsEn: ['Renew before expiry', 'If license is older than 3 years, book a medical exam first'],
      autoFillFields: ['fullName', 'licenseNumber', 'nationalId', 'address', 'issueDate', 'expiryDate'],
    },

    passport: {
      labelAr: 'جواز السفر',
      labelEn: 'Passport',
      icon: '📘',
      renewalPeriodDays: 1825,
      gracePeriodDays: 0,
      fineAmount: null,
      finePerDay: null,
      fineAfterGrace: false,
      fineDescriptionAr: 'لا توجد غرامة تأخير لتجديد جواز السفر',
      fineDescriptionEn: 'No late fee for passport renewal',
      minRenewalBefore: 180,
      maxRenewalBefore: 1,
      platform: {
        nameAr: 'أبشر',
        nameEn: 'Absher',
        url: 'https://www.absher.sa',
        loginRequired: true,
      },
      stepsAr: [
        'تسجيل الدخول إلى أبشر',
        'اختيار "الخدمات الإلكترونية" → "الجوازات"',
        'اختيار "تجديد جواز السفر"',
        'تأكيد البيانات',
        'سداد الرسوم',
        'استلام الجواز عبر البريد الممتاز أو أقرب مكتب جوازات',
      ],
      stepsEn: [
        'Log in to Absher',
        'Select "Electronic Services" → "Passports"',
        'Select "Renew Passport"',
        'Confirm data',
        'Pay fees',
        'Receive passport via courier or nearest passport office',
      ],
      requiredDocumentsAr: ['صورة من الجواز الحالي', 'صورة شخصية', 'صورة من سجل الأسرة (للمتزوجين)'],
      requiredDocumentsEn: ['Copy of current passport', 'Personal photo', 'Copy of family register (if married)'],
      feesAr: 'رسوم التجديد: 300 ريال (لمدة 5 سنوات)',
      feesEn: 'Renewal fee: 300 SAR (5 years)',
      fines: [],
      tipsAr: ['جواز السفر يجب أن يكون ساري المفعول للسفر', 'جدد قبل 6 أشهر من انتهاء الصلاحية'],
      tipsEn: ['Passport must be valid for travel', 'Renew 6 months before expiry'],
      autoFillFields: ['fullName', 'passportNumber', 'nationalId', 'dateOfBirth', 'issueDate', 'expiryDate'],
    },

    car_registration: {
      labelAr: 'استمارة السيارة',
      labelEn: 'Car Registration (Istimara)',
      icon: '🚙',
      renewalPeriodDays: 365,
      gracePeriodDays: 30,
      fineAmount: 100,
      finePerDay: null,
      fineAfterGrace: true,
      fineDescriptionAr: 'غرامة تأخير تجديد الاستمارة: 100 ريال',
      fineDescriptionEn: 'Car registration renewal late fee: 100 SAR',
      minRenewalBefore: 30,
      maxRenewalBefore: 1,
      platform: {
        nameAr: 'أبشر',
        nameEn: 'Absher',
        url: 'https://www.absher.sa',
        loginRequired: true,
        app: 'أبشر أفراد',
      },
      stepsAr: [
        'تسجيل الدخول إلى أبشر',
        'اختيار "الخدمات الإلكترونية" → "المرور"',
        'اختيار "تجديد استمارة السيارة"',
        'تأكيد بيانات المركبة والتأمين',
        'سداد الرسوم',
        'طباعة الاستمارة الجديدة',
      ],
      stepsEn: [
        'Log in to Absher',
        'Select "Electronic Services" → "Traffic"',
        'Select "Renew Car Registration"',
        'Confirm vehicle data and insurance',
        'Pay fees',
        'Print new registration card',
      ],
      requiredDocumentsAr: ['استمارة السيارة الحالية', 'تأمين ساري المفعول', 'فحص دوري (إذا كانت السيارة مضى عليها أكثر من 3 سنوات)'],
      requiredDocumentsEn: ['Current registration card', 'Valid insurance', 'Periodic inspection (if car is older than 3 years)'],
      feesAr: 'رسوم التجديد: 100 ريال للمركبات الخاصة',
      feesEn: 'Renewal fee: 100 SAR for private vehicles',
      fines: [
        { reasonAr: 'تأخير التجديد', reasonEn: 'Late renewal', amount: 100 },
        { reasonAr: 'عدم وجود تأمين', reasonEn: 'No insurance', amount: 150 },
      ],
      tipsAr: ['تأكد من سريان التأمين قبل التجديد', 'إذا عمر السيارة أكثر من 3 سنوات، اعمل فحص دوري أولاً'],
      tipsEn: ['Ensure insurance is valid before renewal', 'If car is older than 3 years, do periodic inspection first'],
      autoFillFields: ['fullName', 'plateNumber', 'nationalId', 'vehicleMake', 'vehicleModel', 'issueDate', 'expiryDate'],
    },

    insurance: {
      labelAr: 'التأمين',
      labelEn: 'Insurance',
      icon: '🛡️',
      renewalPeriodDays: 365,
      gracePeriodDays: 0,
      fineAmount: null,
      finePerDay: null,
      fineAfterGrace: false,
      fineDescriptionAr: 'التأمين الإلزامي مطلوب قانونياً. القيادة بدون تأمين غرامتها 150 ريال',
      fineDescriptionEn: 'Compulsory insurance is legally required. Driving without insurance: 150 SAR fine',
      minRenewalBefore: 30,
      maxRenewalBefore: 1,
      platform: {
        nameAr: 'تأميني',
        nameEn: 'Tameeni',
        url: 'https://www.tameeni.gov.sa',
        app: 'تأميني',
      },
      stepsAr: [
        'الدخول إلى منصة تأميني أو تطبيق شركة التأمين',
        'اختيار "تجديد وثيقة التأمين"',
        'إدخال بيانات المركبة أو المعلومات الشخصية',
        'اختيار التغطية التأمينية المناسبة',
        'الدفع أون لاين',
        'استلام الوثيقة إلكترونياً',
      ],
      stepsEn: [
        'Log in to Tameeni or insurance company app',
        'Select "Renew Insurance Policy"',
        'Enter vehicle or personal data',
        'Choose suitable coverage',
        'Pay online',
        'Receive policy electronically',
      ],
      requiredDocumentsAr: ['استمارة السيارة', 'رخصة القيادة', 'رقم الهوية'],
      requiredDocumentsEn: ['Car registration', 'Driving license', 'ID number'],
      feesAr: 'تختلف حسب نوع التغطية والمركبة (تأمين إلزامي يبدأ من 300 ريال)',
      feesEn: 'Varies by coverage type and vehicle (Compulsory from 300 SAR)',
      fines: [
        { reasonAr: 'القيادة بدون تأمين', reasonEn: 'Driving without insurance', amount: 150 },
        { reasonAr: 'انتهاء التأمين أثناء القيادة', reasonEn: 'Expired insurance while driving', amount: 150 },
      ],
      tipsAr: ['قارن الأسعار بين شركات التأمين', 'التأمين الشامل أفضل حماية لك'],
      tipsEn: ['Compare prices between insurance companies', 'Comprehensive insurance offers better protection'],
      autoFillFields: ['fullName', 'nationalId', 'vehiclePlate', 'vehicleModel'],
    },

    tenancy: {
      labelAr: 'عقد الإيجار',
      labelEn: 'Tenancy Contract',
      icon: '🏠',
      renewalPeriodDays: 365,
      gracePeriodDays: 30,
      fineAmount: null,
      finePerDay: null,
      fineAfterGrace: false,
      fineDescriptionAr: 'يجب توثيق العقد عبر منصة إيجار قبل انتهائه',
      fineDescriptionEn: 'Contract must be registered via Ejar before expiry',
      minRenewalBefore: 90,
      maxRenewalBefore: 1,
      platform: {
        nameAr: 'إيجار',
        nameEn: 'Ejar',
        url: 'https://www.ejar.sa',
        app: 'إيجار',
      },
      stepsAr: [
        'تسجيل الدخول إلى منصة إيجار',
        'اختيار "عقودي" ثم "تجديد عقد"',
        'مراجعة بنود العقد مع المؤجر',
        'توقيع العقد إلكترونياً',
        'دفع رسوم التوثيق',
      ],
      stepsEn: [
        'Log in to Ejar platform',
        'Select "My Contracts" → "Renew Contract"',
        'Review contract terms with landlord',
        'Sign contract electronically',
        'Pay documentation fees',
      ],
      requiredDocumentsAr: ['عقد الإيجار الحالي', 'صورة من الهوية', 'رقم الحساب البنكي لدفع الإيجار'],
      requiredDocumentsEn: ['Current tenancy contract', 'ID copy', 'Bank account number for rent payment'],
      feesAr: 'رسوم توثيق العقد: 50 ريال (قابلة للزيادة حسب المنطقة)',
      feesEn: 'Contract documentation fee: 50 SAR (may vary by region)',
      fines: [],
      tipsAr: ['وثق عقدك في إيجار لحماية حقوقك', 'جدد قبل انتهاء العقد بشهر'],
      tipsEn: ['Register your contract on Ejar to protect your rights', 'Renew one month before expiry'],
      autoFillFields: ['fullName', 'nationalId', 'propertyAddress', 'landlordName', 'rentAmount'],
    },
  },

  trafficViolations: {
    platform: {
      nameAr: 'أبشر',
      nameEn: 'Absher',
      url: 'https://www.absher.sa',
      app: 'أبشر أفراد',
      queryStepsAr: ['تسجيل الدخول إلى أبشر', 'الخدمات الإلكترونية → "المرور"', 'اختيار "الاستعلام عن المخالفات"', 'سداد المخالفات عبر سداد'],
      queryStepsEn: ['Log in to Absher', 'Electronic Services → "Traffic"', 'Select "Inquire about violations"', 'Pay violations via SADAD'],
    },
    commonFines: [
      { reasonAr: 'تجاوز السرعة (أقل من 20 كم)', reasonEn: 'Speeding (less than 20 km/h)', amount: 150 },
      { reasonAr: 'تجاوز السرعة (20-30 كم)', reasonEn: 'Speeding (20-30 km/h)', amount: 300 },
      { reasonAr: 'تجاوز السرعة (30-40 كم)', reasonEn: 'Speeding (30-40 km/h)', amount: 500 },
      { reasonAr: 'تجاوز السرعة (أكثر من 40 كم)', reasonEn: 'Speeding (more than 40 km/h)', amount: 1000 },
      { reasonAr: 'استخدام الجوال أثناء القيادة', reasonEn: 'Using phone while driving', amount: 150 },
      { reasonAr: 'عدم ربط حزام الأمان', reasonEn: 'Not wearing seatbelt', amount: 150 },
      { reasonAr: 'قطع الإشارة الحمراء', reasonEn: 'Running red light', amount: 500 },
      { reasonAr: 'الوقوف في أماكن ممنوعة', reasonEn: 'Parking in prohibited areas', amount: 150 },
      { reasonAr: 'القيادة بدون رخصة', reasonEn: 'Driving without license', amount: 900 },
      { reasonAr: 'القيادة بدون تأمين', reasonEn: 'Driving without insurance', amount: 150 },
      { reasonAr: 'تجاوز حافلات المدارس', reasonEn: 'Overtaking school buses', amount: 3000 },
    ],
  },

  generalPlatforms: [
    { nameAr: 'أبشر', nameEn: 'Absher', url: 'https://www.absher.sa', descAr: 'المنصة الرئيسية للخدمات الحكومية', descEn: 'Main government services platform' },
    { nameAr: 'وزارة الداخلية', nameEn: 'Ministry of Interior', url: 'https://www.moi.gov.sa', descAr: 'الخدمات الأمنية والمرورية', descEn: 'Security and traffic services' },
    { nameAr: 'إيجار', nameEn: 'Ejar', url: 'https://www.ejar.sa', descAr: 'توثيق عقود الإيجار', descEn: 'Rental contract registration' },
    { nameAr: 'تأميني', nameEn: 'Tameeni', url: 'https://www.tameeni.gov.sa', descAr: 'منصة التأمين الإلكترونية', descEn: 'Insurance platform' },
    { nameAr: 'وزارة العدل', nameEn: 'Ministry of Justice', url: 'https://www.moj.gov.sa', descAr: 'الخدمات العدلية والقضائية', descEn: 'Judicial and legal services' },
    { nameAr: 'منصة النفاذ الوطني', nameEn: 'Nafath', url: 'https://nafath.sa', descAr: 'التحقق الإلكتروني الموحد', descEn: 'Unified electronic verification' },
    { nameAr: 'بلديتي', nameEn: 'Balady', url: 'https://balady.gov.sa', descAr: 'خدمات البلديات', descEn: 'Municipality services' },
    { nameAr: 'قوى', nameEn: 'Qiwa', url: 'https://qiwa.sa', descAr: 'منصة القوى العاملة', descEn: 'Labor force platform' },
  ],
};

const UAE = {
  country: 'AE',
  name: 'الإمارات العربية المتحدة',
  currency: 'AED',
  currencySymbol: 'درهم',

  documents: {
    visa: {
      labelAr: 'تأشيرة الإمارات',
      labelEn: 'UAE Visa',
      icon: '🛂',
      renewalPeriodDays: 365,
      gracePeriodDays: 30,
      fineAmount: 500,
      finePerDay: 100,
      fineAfterGrace: true,
      fineDescriptionAr: 'غرامة تأخير تجديد التأشيرة: 500 درهم + 100 درهم/يوم بعد المهلة',
      fineDescriptionEn: 'Visa renewal late fee: 500 AED + 100 AED/day after grace period',
      minRenewalBefore: 30,
      maxRenewalBefore: 1,
      platform: {
        nameAr: 'الهيئة الاتحادية للهوية والجنسية',
        nameEn: 'ICP - Federal Authority for Identity & Citizenship',
        url: 'https://icp.gov.ae',
      },
      stepsAr: ['تسجيل الدخول إلى موقع الهيئة', 'اختيار "خدمات التأشيرات"', 'تقديم طلب تجديد التأشيرة', 'دفع الرسوم', 'استلام التأشيرة إلكترونياً'],
      stepsEn: ['Log in to ICP website', 'Select "Visa Services"', 'Submit renewal application', 'Pay fees', 'Receive e-visa'],
      requiredDocumentsAr: ['صورة من جواز السفر', 'صورة شخصية', 'صورة من التأشيرة الحالية', 'عقد إيجار (سكني)'],
      requiredDocumentsEn: ['Passport copy', 'Personal photo', 'Current visa copy', 'Tenancy contract'],
      feesAr: 'تختلف حسب نوع التأشيرة (من 500 درهم)',
      feesEn: 'Varies by visa type (from 500 AED)',
      fines: [{ reasonAr: 'تأخير التجديد بعد المهلة', reasonEn: 'Late renewal after grace period', amountFn: (d) => 500 + Math.max(0, d - 30) * 100 }],
      tipsAr: ['جدد قبل 30 يوم من الانتهاء', 'تأكد من سريان جواز السفر'],
      tipsEn: ['Renew 30 days before expiry', 'Ensure passport is valid'],
      autoFillFields: ['fullName', 'passportNumber', 'visaNumber', 'nationality'],
    },
    labor_card: {
      labelAr: 'بطاقة العمل',
      labelEn: 'Labor Card',
      icon: '💼',
      renewalPeriodDays: 365,
      gracePeriodDays: 30,
      fineAmount: 200,
      finePerDay: null,
      fineAfterGrace: true,
      fineDescriptionAr: 'غرامة تجديد بطاقة العمل: 200 درهم',
      fineDescriptionEn: 'Labor card renewal late fee: 200 AED',
      minRenewalBefore: 30,
      maxRenewalBefore: 1,
      platform: {
        nameAr: 'وزارة الموارد البشرية والتوطين',
        nameEn: 'MOHRE - Ministry of Human Resources & Emiratisation',
        url: 'https://www.mohre.gov.ae',
      },
      stepsAr: ['تسجيل الدخول إلى منصة وزارة الموارد البشرية', 'اختيار "خدمات المنشآت"', 'تقديم طلب تجديد بطاقة العمل', 'دفع الرسوم', 'استلام البطاقة'],
      stepsEn: ['Log in to MOHRE platform', 'Select "Establishment Services"', 'Submit labor card renewal', 'Pay fees', 'Receive card'],
      requiredDocumentsAr: ['صورة من جواز السفر', 'صورة من التأشيرة', 'عقد عمل'],
      requiredDocumentsEn: ['Passport copy', 'Visa copy', 'Employment contract'],
      feesAr: 'رسوم التجديد: 200 درهم سنوياً',
      feesEn: 'Renewal fee: 200 AED per year',
      fines: [{ reasonAr: 'تأخير التجديد', reasonEn: 'Late renewal', amount: 200 }],
      tipsAr: ['جدد قبل انتهاء بطاقة العمل بشهر', 'تأكد من تسجيل العقد في الوزارة'],
      tipsEn: ['Renew one month before expiry', 'Ensure contract is registered with MOHRE'],
      autoFillFields: ['fullName', 'laborCardNumber', 'employerName'],
    },
  },

  trafficViolations: {
    platform: { nameAr: 'وزارة الداخلية', nameEn: 'Ministry of Interior', url: 'https://www.moi.gov.ae', app: 'MOI UAE' },
    commonFines: [
      { reasonAr: 'تجاوز السرعة (أقل من 20 كم)', reasonEn: 'Speeding (less than 20 km/h)', amount: 300 },
      { reasonAr: 'تجاوز السرعة (20-30 كم)', reasonEn: 'Speeding (20-30 km/h)', amount: 500 },
      { reasonAr: 'تجاوز السرعة (أكثر من 30 كم)', reasonEn: 'Speeding (more than 30 km/h)', amount: 1000 },
      { reasonAr: 'استخدام الجوال أثناء القيادة', reasonEn: 'Using phone while driving', amount: 400 },
      { reasonAr: 'عدم ربط حزام الأمان', reasonEn: 'Not wearing seatbelt', amount: 400 },
      { reasonAr: 'قطع الإشارة الحمراء', reasonEn: 'Running red light', amount: 1000 },
      { reasonAr: 'القيادة بدون رخصة', reasonEn: 'Driving without license', amount: 1000 },
    ],
  },

  generalPlatforms: [
    { nameAr: 'الهيئة الاتحادية للهوية والجنسية', nameEn: 'ICP', url: 'https://icp.gov.ae', descAr: 'خدمات الهوية والتأشيرات', descEn: 'Identity and visa services' },
    { nameAr: 'وزارة الموارد البشرية والتوطين', nameEn: 'MOHRE', url: 'https://www.mohre.gov.ae', descAr: 'خدمات العمل والعمال', descEn: 'Labor services' },
    { nameAr: 'وزارة الداخلية', nameEn: 'MOI', url: 'https://www.moi.gov.ae', descAr: 'الخدمات الأمنية والمرورية', descEn: 'Security and traffic services' },
    { nameAr: 'دبي الآن', nameEn: 'Dubai Now', url: 'https://www.dubainow.ae', descAr: 'حزمة خدمات دبي المتكاملة', descEn: 'Dubai integrated services' },
    { nameAr: 'تم الإمارات', nameEn: 'TAMM Abu Dhabi', url: 'https://www.tamm.abudhabi', descAr: 'منصة خدمات أبوظبي', descEn: 'Abu Dhabi services platform' },
  ],
};

const EGYPT = {
  country: 'EG',
  name: 'جمهورية مصر العربية',
  currency: 'EGP',
  currencySymbol: 'ج.م',

  documents: {
    passport: {
      labelAr: 'جواز السفر المصري',
      labelEn: 'Egyptian Passport',
      icon: '📘',
      renewalPeriodDays: 1825,
      gracePeriodDays: 0,
      fineAmount: null,
      finePerDay: null,
      fineAfterGrace: false,
      fineDescriptionAr: 'لا توجد غرامة تأخير (يجب التجديد قبل السفر)',
      fineDescriptionEn: 'No late fee (must renew before travel)',
      minRenewalBefore: 180,
      maxRenewalBefore: 1,
      platform: { nameAr: 'مصلحة الجوازات', nameEn: 'Passport Authority', url: 'https://www.eojpassports.com' },
      stepsAr: ['التوجه إلى مصلحة الجوازات أو سلسلة مكتب الأحوال المدنية', 'ملء نموذج طلب تجديد', 'تقديم المستندات المطلوبة', 'سداد الرسوم', 'استلام الجواز بعد المدة المحددة'],
      stepsEn: ['Visit Passport Authority or Civil Affairs office', 'Fill renewal application form', 'Submit required documents', 'Pay fees', 'Receive passport within specified period'],
      requiredDocumentsAr: ['جواز السفر القديم', 'صورة من بطاقة الرقم القومي', 'صورة شخصية حديثة', 'شهادة الميلاد'], 
      requiredDocumentsEn: ['Old passport', 'National ID copy', 'Recent personal photo', 'Birth certificate'],
      feesAr: 'رسوم التجديد: 300 جنيه (لمدة 5 سنوات)',
      feesEn: 'Renewal fee: 300 EGP (5 years)',
      fines: [],
      tipsAr: ['جدد جواز سفرك قبل السفر بـ 6 أشهر', 'تأكد من صلاحية البطاقة الشخصية'],
      tipsEn: ['Renew passport 6 months before travel', 'Ensure national ID is valid'],
      autoFillFields: ['fullName', 'passportNumber', 'nationalId'],
    },
    driving_license: {
      labelAr: 'رخصة القيادة المصرية',
      labelEn: 'Egyptian Driving License',
      icon: '🚗',
      renewalPeriodDays: 365,
      gracePeriodDays: 60,
      fineAmount: 100,
      finePerDay: null,
      fineAfterGrace: true,
      fineDescriptionAr: 'غرامة تأخير تجديد الرخصة: 100 جنيه',
      fineDescriptionEn: 'Driving license renewal late fee: 100 EGP',
      minRenewalBefore: 30,
      maxRenewalBefore: 1,
      platform: { nameAr: 'مرور', nameEn: 'Traffic Department', url: 'https://www.morour.gov.eg' },
      stepsAr: ['التوجه إلى قسم المرور التابع له', 'ملء نموذج تجديد الرخصة', 'إجراء الكشف الطبي', 'سداد الرسوم', 'استلام الرخصة الجديدة'],
      stepsEn: ['Visit your traffic department', 'Fill renewal form', 'Complete medical examination', 'Pay fees', 'Receive new license'],
      requiredDocumentsAr: ['رخصة القيادة القديمة', 'صورة من بطاقة الرقم القومي', 'صورة شخصية', 'شهادة طبية'],
      requiredDocumentsEn: ['Old driving license', 'National ID copy', 'Personal photo', 'Medical certificate'],
      feesAr: 'رسوم التجديد: 100 جنيه سنوياً',
      feesEn: 'Renewal fee: 100 EGP per year',
      fines: [{ reasonAr: 'تأخير التجديد', reasonEn: 'Late renewal', amount: 100 }],
      tipsAr: ['جدد رخصتك قبل انتهائها بشهر', 'اربط حزام الأمان دائماً'],
      tipsEn: ['Renew one month before expiry', 'Always wear seatbelt'],
      autoFillFields: ['fullName', 'licenseNumber', 'nationalId'],
    },
    car_registration: {
      labelAr: 'تراخيص المركبات',
      labelEn: 'Vehicle Registration',
      icon: '🚙',
      renewalPeriodDays: 365,
      gracePeriodDays: 30,
      fineAmount: 100,
      finePerDay: null,
      fineAfterGrace: true,
      fineDescriptionAr: 'غرامة تأخير تجديد ترخيص المركبة: 100 جنيه',
      fineDescriptionEn: 'Vehicle registration renewal late fee: 100 EGP',
      minRenewalBefore: 30,
      maxRenewalBefore: 1,
      platform: { nameAr: 'مرور', nameEn: 'Traffic Department', url: 'https://www.morour.gov.eg' },
      stepsAr: ['التوجه إلى قسم المرور', 'فحص المركبة', 'سداد رسوم الترخيص', 'استلام الملصق'],
      stepsEn: ['Visit traffic department', 'Vehicle inspection', 'Pay fees', 'Receive sticker'],
      requiredDocumentsAr: ['رخصة المركبة القديمة', 'تأمين ساري', 'بطاقة الرقم القومي', 'فحص فني'],
      requiredDocumentsEn: ['Old registration', 'Valid insurance', 'National ID', 'Technical inspection'],
      feesAr: 'رسوم التجديد: 200 جنيه للمركبات الخاصة',
      feesEn: 'Renewal fee: 200 EGP for private vehicles',
      fines: [{ reasonAr: 'تأخير التجديد', reasonEn: 'Late renewal', amount: 100 }],
      tipsAr: ['تأكد من سريان التأمين', 'اعمل الفحص الدوري قبل التجديد'],
      tipsEn: ['Ensure valid insurance', 'Do periodic inspection before renewal'],
      autoFillFields: ['fullName', 'plateNumber', 'nationalId'],
    },
  },

  trafficViolations: {
    platform: { nameAr: 'مرور مصر', nameEn: 'Egypt Traffic', url: 'https://www.morour.gov.eg' },
    commonFines: [
      { reasonAr: 'تجاوز السرعة (أقل من 20 كم)', reasonEn: 'Speeding (less than 20 km/h)', amount: 300 },
      { reasonAr: 'تجاوز السرعة (أكثر من 20 كم)', reasonEn: 'Speeding (more than 20 km/h)', amount: 800 },
      { reasonAr: 'قطع الإشارة الحمراء', reasonEn: 'Running red light', amount: 500 },
      { reasonAr: 'استخدام الجوال أثناء القيادة', reasonEn: 'Using phone while driving', amount: 300 },
      { reasonAr: 'القيادة بدون رخصة', reasonEn: 'Driving without license', amount: 1000 },
    ],
  },

  generalPlatforms: [
    { nameAr: 'مصلحة الجوازات', nameEn: 'Passport Authority', url: 'https://www.eojpassports.com', descAr: 'خدمات الجوازات', descEn: 'Passport services' },
    { nameAr: 'مرور مصر', nameEn: 'Traffic Department', url: 'https://www.morour.gov.eg', descAr: 'خدمات المرور', descEn: 'Traffic services' },
    { nameAr: 'مصلحة الضرائب', nameEn: 'Tax Authority', url: 'https://www.eta.gov.eg', descAr: 'الخدمات الضريبية', descEn: 'Tax services' },
    { nameAr: 'التأمين الاجتماعي', nameEn: 'Social Insurance', url: 'https://www.nosi.gov.eg', descAr: 'خدمات التأمينات', descEn: 'Insurance services' },
  ],
};

class GovernmentService {
  getRules(country = 'SA') {
    if (country === 'SA') return SAUDI;
    if (country === 'AE') return UAE;
    if (country === 'EG') return EGYPT;
    return SAUDI;
  }

  getDocumentRules(docType, country = 'SA') {
    const rules = this.getRules(country);
    return rules.documents[docType] || null;
  }

  getRemainingDays(expiryDate) {
    if (!expiryDate) return null;
    const now = new Date();
    const diff = new Date(expiryDate) - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  getOverdueDays(expiryDate) {
    if (!expiryDate) return null;
    const now = new Date();
    const diff = now - new Date(expiryDate);
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  getRenewalStatus(docType, expiryDate, country = 'SA') {
    const rules = this.getDocumentRules(docType, country);
    if (!rules || !expiryDate) return { status: 'unknown' };

    const remaining = this.getRemainingDays(expiryDate);
    const overdue = this.getOverdueDays(expiryDate);

    if (remaining === 0 && overdue > 0) {
      const fineAmount = rules.fines?.[0];
      let estimatedFine = 0;
      if (fineAmount) {
        if (typeof fineAmount.amountFn === 'function') {
          estimatedFine = fineAmount.amountFn(overdue);
        } else {
          estimatedFine = fineAmount.amount || 0;
        }
      }
      return { status: 'expired', overdueDays: overdue, estimatedFine, fineDescription: rules.fineDescriptionAr };
    }

    if (remaining <= rules.gracePeriodDays && remaining > 0) {
      return { status: 'expiring_soon', remainingDays: remaining, gracePeriod: rules.gracePeriodDays };
    }

    if (remaining <= rules.minRenewalBefore && remaining > 0) {
      return { status: 'can_renew', remainingDays: remaining };
    }

    return { status: 'active', remainingDays: remaining };
  }

  getRenewalSteps(docType, country = 'SA') {
    const rules = this.getDocumentRules(docType, country);
    if (!rules) return [];
    return rules.stepsAr;
  }

  getRequiredDocuments(docType, country = 'SA') {
    const rules = this.getDocumentRules(docType, country);
    if (!rules) return [];
    return rules.requiredDocumentsAr;
  }

  getFines(docType, country = 'SA') {
    const rules = this.getDocumentRules(docType, country);
    if (!rules) return [];
    return rules.fines;
  }

  getPlatformInfo(docType, country = 'SA') {
    const rules = this.getDocumentRules(docType, country);
    if (!rules) return null;
    return rules.platform;
  }

  getTips(docType, country = 'SA') {
    const rules = this.getDocumentRules(docType, country);
    if (!rules) return [];
    return rules.tipsAr;
  }

  getLink(docType, country = 'SA') {
    const rules = this.getDocumentRules(docType, country);
    return rules?.platform?.url || '';
  }

  getAllPlatforms(country = 'SA') {
    return this.getRules(country).generalPlatforms;
  }

  getTrafficViolations(country = 'SA') {
    return this.getRules(country).trafficViolations;
  }

  getDocTypes(country = 'SA') {
    return Object.keys(this.getRules(country).documents);
  }

  async suggestRenewalDate(docType, expiryDate, country = 'SA') {
    const rules = this.getDocumentRules(docType, country);
    if (!rules || !expiryDate) return null;

    const expiry = new Date(expiryDate);
    const now = new Date();
    const remaining = this.getRemainingDays(expiryDate);

    if (remaining <= 0) return { suggestion: 'فوري', detail: 'الوثيقة منتهية. جددها فوراً', urgency: 'urgent' };

    if (remaining <= rules.gracePeriodDays) {
      return {
        suggestion: `خلال ${remaining} يوم`,
        detail: `متبقي ${remaining} يوم. لا تتأخر في التجديد`,
        urgency: 'high',
        recommendedDate: now,
      };
    }

    const bestDate = new Date(expiry);
    bestDate.setDate(bestDate.getDate() - rules.minRenewalBefore);
    if (bestDate < now) bestDate.setTime(now.getTime());

    return {
      suggestion: `في ${bestDate.toLocaleDateString('ar-SA')}`,
      detail: `أفضل وقت للتجديد قبل ${rules.minRenewalBefore} يوم من انتهاء الصلاحية`,
      urgency: 'medium',
      recommendedDate: bestDate,
    };
  }
}

module.exports = new GovernmentService();
