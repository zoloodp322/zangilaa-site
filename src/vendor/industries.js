// Салбар бүрийн загвар: шошго, анхдагч өнгө/фонт/бүтэц, жишээ агуулга.
// Шинэ салбар нэмэхдээ энэ объектод нэг түлхүүр нэмэхэд хангалттай.

const weekdays = (open, close, satClose = close, sunClosed = false) => [
  ...Array.from({ length: 5 }, () => ({ open, close, closed: false })),
  { open, close: satClose, closed: false },
  { open, close: satClose, closed: sunClosed },
];

export const INDUSTRIES = {
  restaurant: {
    name: 'Хоолны газар, кафе',
    itemsTitle: 'Цэс',
    itemWord: 'Хоол',
    theme: { layout: 'menu', palette: 'chili', font: 'paratype' },
    content: {
      tagline: 'Гэрийн амттай өдрийн хоол, халуун цай',
      about: 'Бид өдөр бүр шинэ махаар, газар дээр нь хийдэг. Оффисын ажилчдад хүргэлттэй.',
      items: [
        { name: 'Цуйван', desc: 'Гар гурил, үхрийн мах, ногоо', price: '14,000₮' },
        { name: 'Бууз (5 ширхэг)', desc: 'Хонины мах, сонгино', price: '12,000₮' },
        { name: 'Гуляш будаатай', desc: 'Үхрийн мах, соус, салат', price: '15,000₮' },
        { name: 'Сүүтэй цай', desc: 'Термосоор', price: '3,000₮' },
      ],
      hours: weekdays('09:00', '21:00', '20:00'),
    },
  },
  beauty: {
    name: 'Гоо сайхан, үсчин',
    itemsTitle: 'Үйлчилгээ, үнэ',
    itemWord: 'Үйлчилгээ',
    theme: { layout: 'card', palette: 'plum', font: 'friendly' },
    content: {
      tagline: 'Цаг товлоод, дараалалгүй үйлчлүүлээрэй',
      about: 'Мэргэжлийн үсчин, маникюрын мастерууд. Олон улсын брэндийн будаг, арчилгааны бүтээгдэхүүн хэрэглэдэг.',
      items: [
        { name: 'Эмэгтэй үс засалт', desc: 'Угаалга, хатаалга орно', price: '25,000₮-с' },
        { name: 'Үс будах', desc: 'Үсний уртаас хамаарна', price: '60,000₮-с' },
        { name: 'Маникюр, гель', desc: 'Дизайн сонголттой', price: '35,000₮' },
      ],
      hours: weekdays('10:00', '20:00', '19:00'),
    },
  },
  clinic: {
    name: 'Шүдний болон хувийн эмнэлэг',
    itemsTitle: 'Эмчилгээ, үйлчилгээ',
    itemWord: 'Үйлчилгээ',
    theme: { layout: 'card', palette: 'clinic', font: 'rounded' },
    content: {
      tagline: 'Урьдчилан цаг захиалж, хүлээлгүй үзүүлээрэй',
      about: 'Туршлагатай эмч нар, ариутгалын стандарт хангасан кабинет. Хүүхэд, насанд хүрэгчдэд.',
      items: [
        { name: 'Үзлэг, зөвлөгөө', desc: 'Анхны үзлэг', price: '20,000₮' },
        { name: 'Шүдний чулуу авах', desc: 'Ультрасаунд цэвэрлэгээ', price: '50,000₮' },
        { name: 'Ломбо', desc: 'Гэрлээр хатуурдаг материал', price: '70,000₮-с' },
      ],
      hours: weekdays('09:00', '18:00', '14:00', true),
    },
  },
  auto: {
    name: 'Авто засвар, угаалга',
    itemsTitle: 'Засвар үйлчилгээ',
    itemWord: 'Ажил',
    theme: { layout: 'poster', palette: 'garage', font: 'sturdy' },
    content: {
      tagline: 'Оношлогоо, тос солих, явах эд анги',
      about: 'Японы болон Солонгосын машинд мэргэшсэн. Ажлын баталгаа 3 сар.',
      items: [
        { name: 'Хөдөлгүүрийн тос солих', desc: 'Шүүлтүүр орно, тос тусдаа', price: '30,000₮' },
        { name: 'Компьютер оношлогоо', desc: 'Алдааны код уншиж тайлбарлана', price: '25,000₮' },
        { name: 'Дугуй солих, тэнцвэржүүлэх', desc: '4 дугуй', price: '40,000₮' },
      ],
      hours: weekdays('09:00', '19:00', '17:00'),
    },
  },
  retail: {
    name: 'Дэлгүүр',
    itemsTitle: 'Бараа',
    itemWord: 'Бараа',
    theme: { layout: 'card', palette: 'harbor', font: 'rounded' },
    content: {
      tagline: 'Хотын дотор хүргэлттэй',
      about: 'Чанартай бараа, боломжийн үнэ. Утсаар захиалга авна.',
      items: [
        { name: 'Бараа 1', desc: 'Товч тайлбар', price: '0₮' },
        { name: 'Бараа 2', desc: 'Товч тайлбар', price: '0₮' },
        { name: 'Бараа 3', desc: 'Товч тайлбар', price: '0₮' },
      ],
      hours: weekdays('10:00', '20:00'),
    },
  },
  tourism: {
    name: 'Жуулчны бааз, зочид буудал',
    itemsTitle: 'Өрөө, аялал',
    itemWord: 'Багц',
    theme: { layout: 'poster', palette: 'steppe', font: 'paratype' },
    content: {
      tagline: 'Хотоос 2 цагийн зайд, голын эрэг дээр',
      about: 'Уламжлалт гэр, халуун усны шүршүүр, морин аялал. 6-р сараас 9-р сар хүртэл ажиллана.',
      items: [
        { name: '4 ортой гэр', desc: 'Өглөөний цай орно, 1 хоног', price: '180,000₮' },
        { name: 'Морин аялал', desc: 'Хөтөчтэй, 3 цаг', price: '50,000₮' },
        { name: 'Хорхог', desc: '4–6 хүнд', price: '220,000₮' },
      ],
      hours: weekdays('00:00', '23:59'),
    },
  },
  education: {
    name: 'Сургалтын төв',
    itemsTitle: 'Хөтөлбөр',
    itemWord: 'Хөтөлбөр',
    theme: { layout: 'menu', palette: 'khukh', font: 'modern' },
    content: {
      tagline: 'Жижиг анги, хувь хүнд тохирсон хичээл',
      about: 'Туршлагатай багш нар. Түвшин тогтоох шалгалт үнэгүй.',
      items: [
        { name: 'Англи хэл, анхан шат', desc: '3 сар, долоо хоногт 3 удаа', price: '450,000₮' },
        { name: 'IELTS бэлтгэл', desc: '2 сар, эрчимжүүлсэн', price: '800,000₮' },
      ],
      hours: weekdays('09:00', '20:00', '15:00', true),
    },
  },
};

export function blankContent(industryKey) {
  const ind = INDUSTRIES[industryKey];
  return {
    tagline: ind.content.tagline,
    about: ind.content.about,
    notice: '',
    items: structuredClone(ind.content.items),
    hours: structuredClone(ind.content.hours),
    contact: { phone: '', phone2: '', email: '', address: '', mapUrl: '', facebook: '', instagram: '' },
    heroImage: null,
    gallery: [],
    seoDescription: '',
  };
}

export const DAY_NAMES = ['Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба', 'Ням'];
