import type { AppState, Story, Chapter } from './types';

const now = Date.now();

function ch(
  id: string,
  number: number,
  title: string,
  content: string,
  access: 'free' | 'vip' = 'free',
  status: 'published' | 'draft' = 'published',
  offset: number = 0,
): Chapter {
  return { id, number, title, content, access, status, createdAt: now - offset };
}

const blStory: Story = {
  id: 'story-bl-001',
  title: 'ดวงดาวเหนือเงาใจ',
  penName: 'Aksara',
  synopsis:
    'เมื่อนักเรียนหน้าใสที่โดดเด่นด้านการเรียนอย่าง "ธีร์" ต้องมาพัวะพันกับรุ่นพี่โรงเรียนเดิมที่เคยหายไปโดยไม่บอกลา "ไครัล" ความรู้สึกที่ถูกฝังไว้กลับมาสั่นสะเทือนอีกครั้ง ทั้งสองต้องเผชิญหน้ากับความลับที่ซ่อนอยู่เบื้องหลังการจากไป และความรู้สึกที่ไม่เคยดับสูญ',
  intro:
    '## แนะนำตัวละคร\n\n**ธีร์ (ธีรวิชญ์)** — นักเรียนม.ปลาย หน้าตาดี เรียนเก่ง ปากแข็ง แต่หัวใจอ่อนโยน เก็บความรู้สึกที่มีต่อรุ่นพี่เก่าไว้ลึกสุดใจ ไม่เคยลืมคนที่หายไปโดยไม่บอกลา\n\n**ไครัล (ไครัล วิทยา)** — รุ่นพี่โรงเรียนเดิม อารมณ์ดูเย็นชา แต่จริงๆ แล้วซ่อนความเจ็บปวดไว้ข้างใน หายไปสองปีโดยไม่มีใครรู้สาเหตุ กลับมาพร้อมความลับที่จะเปลี่ยนทุกอย่าง\n\n## เกร็ดเรื่อง\nเรื่องราวเกิดขึ้นในโรงเรียนสหศึกษาเอกชน แห่งหนึ่งในกรุงเทพฯ สถานที่ที่ทั้งสองเคยใช้เวลาร่วมกัน ดูดาว ฝนตก และแบ่งปันความฝัน\n\n> "บางครั้งคนที่ทำให้เราเจ็บ ไม่ได้ตั้งใจให้เราเจ็บ... เขาแค่ไม่มีทางเลือก"\n\n## จุดที่น่าสนใจ\n- ความสัมพันธ์ที่ซับซ้อนระหว่างธีร์และไครัล\n- ความลับเบื้องหลังการหายไป 2 ปี\n- มิตรภาพ ความเสียสละ และการให้อภัย\n- บรรยากาศโรงเรียนที่อบอุ่นแต่แฝงความเศร้า',
  category: 'นิยายวาย (Boy Love / BL)',
  ageRating: '18+',
  tags: ['BL', 'School', 'Drama', 'First Love', 'Reunion', 'Angst'],
  coverColor: '#E07A5F',
  coverPattern: 'stars',
  status: 'published',
  isFree: false,
  readCount: 128400,
  likeCount: 8920,
  bookmarkCount: 3450,
  createdAt: now - 86400000 * 30,
  chapters: [
    ch(
      'bl-c1',
      1,
      'บทที่ 1: การกลับมา',
      '<p>ธีร์ยืนอยู่หน้าประตูโรงเรียนเก่า สายลมพัดผ่านผมที่ปรบไหล่เบาๆ ภาพจำที่เคยชัดเจนกลับเลือนรางลงทุกวัน แต่วันนี้... เขากลับมาที่นี่อีกครั้ง</p><p>"ธีร์?" เสียงที่คุ้นเคยดังขึ้นจากด้านหลัง หัวใจที่เคยหยุดเต้นกลับเต้นแรงจนแทบจะกระแทกซี่โครง</p><p>ไครัล... รุ่นพี่ที่หายไปโดยไม่บอกลา ยืนอยู่ตรงหน้า รอยยิ้มเดิมๆ แต่สายตาเปลี่ยนไป</p><h2>สิ่งที่เปลี่ยนไป</h2><p>สองปีผ่านไป ทุกอย่างดูเหมือนเดิม แต่ความรู้สึกลึกๆ บอกว่าไม่มีอะไรเหมือนเดิมอีกแล้ว</p>',
      'free',
    ),
    ch(
      'bl-c2',
      2,
      'บทที่ 2: เงาใจ',
      '<p>"ทำไมถึงหายไป?" ธีร์ถาม เสียงสั่นเล็กน้อย มือกำชายเสื้อแน่น</p><p>ไครัลเงียบไปสักพัก สายตาจ้องมองไกลออกไปราวกับกำลังมองเห็นอดีตที่ไม่อยากจะจดจำ "บางอย่าง... ฉันไม่สามารถบอกเธอได้"</p><p>"แต่ฉันมีสิทธิ์รู้" ธีร์ก้าวเข้าใกล้ "สองปี ไครัล สองปีที่ฉันรอ"</p><p>ลมหนาวพัดผ่านช่องว่างระหว่างสองคน ความลับที่ซ่อนไว้กำลังค่อยๆ ถูกเปิดเผย</p>',
      'free',
    ),
    ch(
      'bl-c3',
      3,
      'บทที่ 3: ดวงดาวเหนือ',
      '<p>คืนนั้นฟ้าปลอดเมฆ ดาวเรืองรองกระจายอยู่ทั่วท้องฟ้า ธีร์และไครัลนั่งอยู่บนเนินเขาเล็กๆ หลังโรงเรียน ที่เดิมที่พวกเขาเคยมาดูดาวด้วยกัน</p><p>"ธีร์... ฉันขอโทษ" เสียงไครัลแตกต่างจากทุกครั้ง มันเต็มไปด้วยความเจ็บปวดที่สะสมมานาน</p><p>ธีร์หันมอง สังเกตเห็นหยดน้ำตาไหลลงบนแก้มของรุ่นพี่คนที่เคยเข้มแข็ง</p><p>"ฉันไม่ได้อยากจากไป... แต่ถ้าฉันอยู่ต่อ ฉันจะทำให้เธอเดือดร้อน"</p>',
      'vip',
    ),
    ch(
      'bl-c4',
      4,
      'บทที่ 4: เงาที่ไม่มีวันหาย',
      '<p>ความจริงค่อยๆ ปรากฏ ไครัลเปิดเผยเหตุผลที่เขาต้องจากไป มันเกี่ยวข้องกับครอบครัว กับหนี้สิน และกับสัญญาที่เขาไม่เคยบอกใคร</p><p>ธีร์ฟังอย่างเงียบงัน หัวใจเจ็บปวด แต่ความเข้าใจค่อยๆ เกิดขึ้น</p><p>"ต่อไปนี้ ไม่ว่าจะเกิดอะไรขึ้น ฉันจะไม่ปล่อยมืออีก" ธีร์บอก กำมือของไครัลแน่นขึ้น</p>',
      'vip',
    ),
  ],
};

const survivalStory: Story = {
  id: 'story-survival-001',
  title: 'วันสิ้นโลกที่ฉันยังหายใจ',
  penName: 'Aksara',
  synopsis:
    'เมื่อสึนามิพลิกชีวิตชายหนุ่มธรรมดาคนหนึ่ง เขาต้องเอาตัวรอดจากซากปรักหักพังของเมืองที่จมน้ำ พร้อมกับเด็กสาวลึกลับที่เขาช่วยไว้ ความหวัง ความสิ้นหวัง และมนุษย์ที่เปลี่ยนไปในวิกฤต จะพาพวกเขาไปถึงไหน',
  intro:
    '## แนะนำตัวละคร\n\n**เอส (เอสรา)** — ชายหนุ่มวัย 24 ทำงานออฟฟิศธรรมดา ไม่เคยคิดว่าตัวเองจะเก่งเรื่องเอาตัวรอด แต่เมื่อวิกฤตมาถึง สัญชาตญาณและความต้องการปกป้องคนข้างตัวทำให้เขาเปลี่ยนไป\n\n**น้ำ** — เด็กสาวอายุ 16 ลึกลับ เงียบขรึม มีทักษะการเอาชีวิตรอดที่ไม่น่าจะมีได้ในวัยเด็ก ซ่อนความลับเกี่ยวกับที่มาของตัวเอง\n\n## ภาพพื้นหลัง\nเรื่องเกิดในเมืองชายฝั่งทะเลทางใต้ของไทย ที่ถูกคลื่นสึนามิถล่มจนจมน้ำทั้งเมือง สภาพแวดล้อมเปลี่ยนจากเมืองท่องเที่ยวสวยงามเป็นซากปรักหักพังในพริบตา\n\n> "ในวันที่โลกหยุดหมุน มนุษย์คือสิ่งที่น่ากลัวที่สุด"\n\n## ธีมของเรื่อง\n- สัญชาตญาณเอาชีวิตรอด vs มนุษยธรรม\n- ผู้คนเปลี่ยนไปในยามวิกฤต\n- ความหวังในความมืดมิด\n- การปกป้องคนที่รักแม้ต้องแลกด้วยชีวิต',
  category: 'วันสิ้นโลก / เอาชีวิตรอด / ไซไฟ',
  ageRating: 'ทุกวัย',
  tags: ['Survival', 'Disaster', 'Tsunami', 'Post-Apocalyptic', 'Hope', 'Action'],
  coverColor: '#2C5F7C',
  coverPattern: 'waves',
  status: 'published',
  isFree: false,
  readCount: 89500,
  likeCount: 6100,
  bookmarkCount: 2100,
  createdAt: now - 86400000 * 20,
  chapters: [
    ch(
      'sur-c1',
      1,
      'บทที่ 1: คลื่นยักษ์',
      '<p>เสียงสัญญาณเตือนภัยดังกึกก้องไปทั่วเมือง "สึนามิ! หนีขึ้นที่สูงทันที!" ประกาศดังจากลำโพงฉุกเฉิน แต่มันสายเกินไป</p><p>เอสเห็นกำแพงน้ำสูงหลายชั้นเฮือนพุ่งเข้าหา ทุกอย่างเกิดขึ้นเร็วเกินจะตอบโต้ เขาคว้าตัวเด็กสาวที่ยืนร้องไห้อยู่กลางถนนแล้ววิ่ง วิ่งสุดชีวิต</p><p>เสียงคลื่นกระหึ่ม ทุกอย่างมืดไป...</p>',
      'free',
    ),
    ch(
      'sur-c2',
      2,
      'บทที่ 2: ซากปรักหักพัง',
      '<p>เอสฟื้นขึ้นมาบนหลังคาตึกที่จมน้ำครึ่งหนึ่ง เด็กสาวข้างๆ ยังหายใจ แต่ไม่รู้สึกตัว รอบๆ คือน้ำที่ไหลเชี่ยว ซากตึก รถ และสิ่งของลอยกระจัดกระจาย</p><p>"เธอชื่ออะไร?" เอสถามเมื่อเด็กสาวลืมตาตื่น</p><p>"น้ำ..." เธอตอบเสียงแผ่ว "ฉันชื่อน้ำ"</p><p>เอสมองไปที่น้ำที่ท่วมทุกอย่าง ชื่อที่ตรงกับสิ่งที่พวกเขาต้องเอาตัวรอด</p>',
      'free',
    ),
    ch(
      'sur-c3',
      3,
      'บทที่ 3: มนุษย์ที่เปลี่ยนไป',
      '<p>วันที่สอง อาหารและน้ำดื่มเริ่มหมด เอสและน้ำพบกับกลุ่มคนที่รอดชีวิต แต่ความหวาดกลัวทำให้คนเปลี่ยนไป บางคนเห็นแก่ตัว บางคนพร้อมจะทำร้ายคนอื่นเพื่อเอาตัวรอด</p><p>"อย่าไว้ใจใคร" ชายวัยกลางคนคนหนึ่งบอก มือกับข้าวของแน่น</p><p>เอสมองน้ำที่นั่งซบอยู่ข้างๆ เขาจะปกป้องเธอให้ได้ ไม่ว่าจะต้องแลกอะไรก็ตาม</p>',
      'vip',
    ),
    ch(
      'sur-c4',
      4,
      'บทที่ 4: แสงสลัว',
      '<p>วันที่ห้า พวกเขาพบเรือยอช์ทลอยอยู่กลางเมือง บนเรือมีอาหารและน้ำ แต่ก็มีคนที่ยึดครองไว้และไม่ยอมแบ่งให้ใคร</p><p>เอสต้องตัดสินใจว่าจะเจรจา ต่อสู้ หรือหาทางอื่น น้ำจับมือเขาเบาๆ "พี่เอส... ฉันเชื่อใจพี่"</p><p>ความหวังเล็กๆ ยังมีอยู่ ถึงแม้แสงจะสลัว แต่มันก็ยังเป็นแสง</p>',
      'vip',
    ),
  ],
};

const retroStory: Story = {
  id: 'story-retro-001',
  title: 'ปริศนาแห่งกรุงรัตนโกสินทร์',
  penName: 'Aksara',
  synopsis:
    'หญิงสาวยุคปัจจุบันตื่นขึ้นมาในร่างของนางสนมในวังหลวงสมัยรัชกาลที่ 5 เธอต้องเอาตัวรอดจากการเมืองในวัง แก้ปริศนาที่เชื่อมโยงอดีตกับปัจจุบัน และค้นหาว่าเหตุใดเธอจึงข้ามเวลามายังที่นี่',
  intro:
    '## แนะนำตัวละคร\n\n**ภัสสร** — หญิงสาวยุคปัจจุบัน อายุ 25 นักประวัติศาสตร์ ตื่นขึ้นมาในร่างนางสนมในวังสมัยรัชกาลที่ 5 ฉลาด กล้าหาญ แต่ต้องระวังตัวเพราะความรู้ยุคใหม่อาจทำให้ตัวเองตกเป็นเป้า\n\n**มหาดเล็กหนุ่ม (เจ้าเสน่ห์)** — มหาดเล็กในวัง หน้าตาดี ซื่อสัตย์ มีความลับเกี่ยวกับการข้ามเวลา รู้เหตุผลที่ภัสสรมาอยู่ที่นี่\n\n## ภาพพื้นหลัง\nเรื่องราวในวังหลวงสมัยรัชกาลที่ 5 ยุคที่ประเทศสยามกำลังเปลี่ยนแปลง วัฒนธรรมผสมระหว่างไทยโบราณและตะวันตก การเมืองในวังซับซ้อน ความอิจฉาริษยา และอำนาจ\n\n> "กาลเวลาไม่เคยผิดพลาด... มันแค่พาเราไปหาสิ่งที่เราต้องรู้"\n\n## จุดเด่นของเรื่อง\n- บรรยากาศวังสมัยรัชกาลที่ 5 อย่างละเอียด\n- ปริศนาการข้ามเวลาที่ทยอยเปิดเผย\n- ความรักข้ามกาลเวลา\n- การเมืองในวังและการเอาตัวรอด',
  category: 'จีนโบราณ / ย้อนยุค / ทะลุมิติ / เทพเซียน',
  ageRating: 'ทุกวัย',
  tags: ['Historical', 'Time Travel', 'Palace', 'Mystery', 'Romance', 'Rama5'],
  coverColor: '#7C5E3C',
  coverPattern: 'palace',
  status: 'published',
  isFree: true,
  readCount: 56200,
  likeCount: 4200,
  bookmarkCount: 1800,
  createdAt: now - 86400000 * 15,
  chapters: [
    ch(
      'ret-c1',
      1,
      'บทที่ 1: ตื่นในวัง',
      '<p>ภัสสรเปิดตา ความทรงจำสุดท้ายคือรถชน แต่สิ่งที่อยู่ตรงหน้าคือเพดานไม้สักแกะสลัก ผ้าปูที่นอนไหมประดับลวดลาย และเสียงนกที่ไม่เคยได้ยินในเมืองกรุงเทพฯ ปัจจุบัน</p><p>"ท่านพระองค์เจ้า ตื่นแล้วหรือขอรับ" สาวใช้วัยหนุ่มค้อมตัวทำความเคารพ</p><p>ภัสสรมองกระจกทองเหลืองบาดตา ใบหน้าที่สะท้อนกลับมาไม่ใช่ใบหน้าของเธอ... หรือมันคือใบหน้าของเธอในอดีตชาติ?</p>',
      'free',
    ),
    ch(
      'ret-c2',
      2,
      'บทที่ 2: กงจักรแห่งวัง',
      '<p>ภัสสรค่อยๆ เรียนรู้ชีวิตในวัง ความซับซ้อนของการเมือง ความอิจฉาริษยาระหว่างนางสนม และกฎระเบียบที่เธอไม่เคยรู้มาก่อน</p><p>"ท่านต้องระวังตัว" มหาดเล็กหนุ่มผู้หนึ่งกระซิบ "มีคนไม่ต้องการให้ท่านอยู่ในวัง"</p><p>ภัสสรมองสบตาเขา ดวงตาคู้นั้นมีอะไรบางอย่างที่คุ้นเคย... ราวกับเธอเคยรู้จักมาก่อน</p>',
      'free',
    ),
    ch(
      'ret-c3',
      3,
      'บทที่ 3: ปริศนา',
      '<p>ภัสสรพบจดหมายเก่าที่เขียนด้วยมือของเธอเอง แต่เธอไม่เคยเขียนมัน ในจดหมายมีปริศนาที่เชื่อมโยงอดีตกับปัจจุบัน และเป็นกุญแจสำคัญที่จะอธิบายว่าเธอมาอยู่ที่นี่ได้อย่างไร</p><p>"ถ้าท่านแก้ปริศนานี้ได้ ท่านอาจจะกลับได้" เสียงหญิงชราดังขึ้นจากมุมห้อง</p><p>แต่... ภัสสรแน่ใจหรือว่าเธออยากกลับ?</p>',
      'free',
    ),
    ch(
      'ret-c4',
      4,
      'บทที่ 4: หัวใจสองยุค',
      '<p>ความรู้สึกของภัสสรที่มีต่อมหาดเล็กหนุ่มเติบโตขึ้นทุกวัน แต่เธอรู้ว่าเธอไม่ใช่คนของยุคนี้ และวันหนึ่งเธออาจต้องจากไป</p><p>"ไม่ว่าท่านจะมาจากไหน ข้าจะจำท่านไว้ตลอดไป" เขาบอก สายตาจริงจัง</p><p>ภัสสรยิ้ม น้ำตาไหลโดยไม่รู้ตัว บางครั้งหัวใจก็ไม่ยอมเชื่อเวลา</p>',
      'free',
    ),
  ],
};

const romanceStory: Story = {
  id: 'story-romance-001',
  title: 'รักที่เฟื่องฟูในสายฝน',
  penName: 'Aksara',
  synopsis:
    'สองหัวใจที่บาดเจ็บจากอดีต บังเอิญมาพบกันในร้านดอกไม้เล็กๆ กลางเมืองฝน เธอหนีความผิดหวังมาเปิดร้าน ส่วนเขามาเช่าห้องข้างบ้านเพื่อเขียนนิยาย ความสัมพันธ์ที่เริ่มจากความไม่ลงรอย ค่อยๆ เบ่งบานเป็นรักที่ทั้งสองไม่กล้ายอมรับ',
  intro:
    '## แนะนำตัวละคร\n\n**เมฆ** — เจ้าของร้านดอกไม้ "ฤดีฟลอริสต์" อายุ 28 หนีความผิดหวังในความรักมาจากกรุงเทพฯ เปิดร้านดอกไม้ในเมืองฝนเล็กๆ ขี้อาย แต่แข็งแกร่ง ไม่ไว้ใจผู้ชาย\n\n**ธนา** — นักเขียนนิยายวัย 30 มาเช่าห้องข้างบ้านเพื่อหาแรงบันดาลใจเขียนนิยายเล่มใหม่ พูดเก่ง ทำตัวสบายๆ แต่ซ่อนความเจ็บปวดจากการถูกปฏิเสธโดยสำนักพิมพ์\n\n## ภาพพื้นหลัง\nเมืองฝนเล็กๆ ทางภาคใต้ ที่ฝนตกเกือบทุกวัน บรรยากาศชื้นฉ่ำ มีกลิ่นดินและดอกไม้ ร้านดอกไม้เล็กๆ ตั้งอยู่ในซอยเงียบสงบ\n\n> "บางครั้งรักก็เหมือนดอกไม้ ต้องรดน้ำทุกวัน แม้วันที่ฝนไม่ตก"\n\n## ธีมของเรื่อง\n- การรักษาบาดแผลใจจากอดีต\n- ความสัมพันธ์ที่ค่อยๆ เติบโต (Slow Burn)\n- เมืองฝนและดอกไม้เป็นเครื่องเปรียบเปรยความรัก\n- กล้าที่จะรักอีกครั้ง',
  category: 'นิยายรักชาย-หญิง (BG / โรแมนติก)',
  ageRating: 'ทุกวัย',
  tags: ['Romance', 'Florist', 'Rainy City', 'Healing', 'Slow Burn', 'Slice of Life'],
  coverColor: '#8E9B6E',
  coverPattern: 'flowers',
  status: 'published',
  isFree: false,
  readCount: 34100,
  likeCount: 2800,
  bookmarkCount: 950,
  createdAt: now - 86400000 * 10,
  chapters: [
    ch(
      'rom-c1',
      1,
      'บทที่ 1: ร้านดอกไม้กลางฝน',
      '<p>ฝนตกไม่หยุดมาสามวันแล้ว เมฆมาเปิดร้านดอกไม้ของเธอทุกเช้าเหมือนเดิม แม้จะไม่มีลูกค้า ร้าน "ฤดีฟลอริสต์" ตั้งอยู่ในซอยเล็กๆ ของเมืองฝนที่เธอหนีมา</p><p>"ขอเช่าห้องข้างบ้านครับ" ชายหนุ่มเสียงทุ้มเดินเข้ามา ผมเปียก ในมือถือกระเป๋าเดินทางใบเดียว</p><p>เมฆมอง ไม่ค่อยถูกกันตั้งแต่แรกเห็น แต่เธอก็ต้องการค่าเช่า...</p>',
      'free',
    ),
    ch(
      'rom-c2',
      2,
      'บทที่ 2: ไม่ลงรอย',
      '<p>ธนาเขียนนิยายกลางคืน เสียงพิมพ์คีย์บอร์ดดังกริ๊กกร๊าก เมฆนอนไม่หลับ โกรธจัด เธอเคาะประตูห้องเขา</p><p>"นี่! มันตอนตีสองแล้วนะ!"</p><p>"ก็ฉันเขียนนิยาย ตีสองก็เขียนได้" ธนายิ้ม ยิ้มที่ทำให้เมฆหงุดหงิดขึ้นไปอีก</p><p>แต่ใต้ความหงุดหงิด มีอะไรบางอย่างที่เมฆไม่อยากยอมรับ</p>',
      'free',
    ),
    ch(
      'rom-c3',
      3,
      'บทที่ 3: บาดแผลเดียวกัน',
      '<p>วันที่เมฆร้องไห้ในร้าน ธนาเห็นเธอ แทนที่จะถาม เขาแค่นั่งข้างๆ ยื่นผ้าเช็ดหน้าให้</p><p>"ฉันเคยเจอมาก่อน... ความเจ็บที่ทำให้คนหนีมาฝน" เขาบอกเสียงเบา</p><p>เมฆมอง สายตาเขาไม่ได้สะท้อนสงสาร แต่เป็นสายตาของคนที่เข้าใจ เพราะเขาก็หนีมาเหมือนกัน</p>',
      'vip',
    ),
    ch(
      'rom-c4',
      4,
      'บทที่ 4: เบ่งบาน',
      '<p>ฤดูฝนผ่านไป ดอกไม้ในร้านเบ่งบาน ความสัมพันธ์ของทั้งคู่ก็เช่นกัน ธนาเสร็จนิยาย และต้องตัดสินใจว่าจะอยู่ต่อหรือกลับกรุงเทพฯ</p><p>"เธอจะไปไหน?" เมฆถาม เสียงสั่นเล็กน้อย มือจัดดอกไม้ไม่สุด</p><p>ธนาวางมือจากกระเป๋า หันมา "ฉันเขียนจบแล้ว... แต่ยังไม่อยากจบที่นี่"</p>',
      'vip',
    ),
  ],
};

export const STORIES: Story[] = [blStory, survivalStory, retroStory, romanceStory];

export const CATEGORIES: { label: string; value: string }[] = [
  { label: 'นิยายรักชาย-หญิง (BG / โรแมนติก)', value: 'นิยายรักชาย-หญิง (BG / โรแมนติก)' },
  { label: 'นิยายวาย (Boy Love / BL)', value: 'นิยายวาย (Boy Love / BL)' },
  { label: 'นิยายยูริ (Girl Love / GL)', value: 'นิยายยูริ (Girl Love / GL)' },
  { label: 'จีนโบราณ / ย้อนยุค / ทะลุมิติ / เทพเซียน', value: 'จีนโบราณ / ย้อนยุค / ทะลุมิติ / เทพเซียน' },
  { label: 'แฟนตาซี / ต่างโลก / ระบบ', value: 'แฟนตาซี / ต่างโลก / ระบบ' },
  { label: 'วันสิ้นโลก / เอาชีวิตรอด / ไซไฟ', value: 'วันสิ้นโลก / เอาชีวิตรอด / ไซไฟ' },
  { label: 'สืบสวน / ลึกลับ / สยองขวัญ', value: 'สืบสวน / ลึกลับ / สยองขวัญ' },
  { label: 'ดราม่า / สะท้อนสังคม', value: 'ดราม่า / สะท้อนสังคม' },
  { label: 'กำลังภายใน / แอ็กชัน', value: 'กำลังภายใน / แอ็กชัน' },
];

export const CATEGORY_FILTERS: { label: string; value: string }[] = [
  { label: 'ทั้งหมด', value: 'ทั้งหมด' },
  { label: 'นิยายวาย (BL)', value: 'นิยายวาย (Boy Love / BL)' },
  { label: 'รักชาย-หญิง (BG)', value: 'นิยายรักชาย-หญิง (BG / โรแมนติก)' },
  { label: 'ยูริ (GL)', value: 'นิยายยูริ (Girl Love / GL)' },
  { label: 'จีนโบราณ/ย้อนยุค', value: 'จีนโบราณ / ย้อนยุค / ทะลุมิติ / เทพเซียน' },
  { label: 'แฟนตาซี/ต่างโลก', value: 'แฟนตาซี / ต่างโลก / ระบบ' },
  { label: 'สิ้นโลก/เอาชีวิตรอด', value: 'วันสิ้นโลก / เอาชีวิตรอด / ไซไฟ' },
  { label: 'สืบสวน/สยองขวัญ', value: 'สืบสวน / ลึกลับ / สยองขวัญ' },
  { label: 'ดราม่า/สังคม', value: 'ดราม่า / สะท้อนสังคม' },
  { label: 'กำลังภายใน/แอ็กชัน', value: 'กำลังภายใน / แอ็กชัน' },
];

export const STICKERS: { id: string; emoji: string; label: string }[] = [
  { id: 'shocked', emoji: '😱', label: 'ตกใจ' },
  { id: 'laughing', emoji: '😆', label: 'หัวเราะ' },
  { id: 'cheering', emoji: '🤩', label: 'เฮฮา' },
  { id: 'heart', emoji: '❤️', label: 'รักเลย' },
  { id: 'crying', emoji: '😭', label: 'ร้องไห้' },
  { id: 'tableflip', emoji: '(╯°□°)╯', label: 'พลิกโต๊ะ' },
  { id: 'angry', emoji: '😤', label: 'หงุดหงิด' },
  { id: 'thinking', emoji: '🤔', label: 'คิดติด' },
  { id: 'love', emoji: '😍', label: 'หลงรัก' },
  { id: 'sad', emoji: '🥺', label: 'เศร้า' },
  { id: 'wow', emoji: '😮', label: 'ว้าว' },
  { id: 'sleepy', emoji: '😴', label: 'ง่วง' },
  { id: 'cool', emoji: '😎', label: 'เท่' },
  { id: 'pray', emoji: '🙏', label: 'สาธุ' },
  { id: 'fire', emoji: '🔥', label: 'ไฟลุก' },
  { id: 'sparkle', emoji: '✨', label: 'วาววาว' },
  { id: 'thumbsup', emoji: '👍', label: 'เยี่ยม' },
];

// Illustrated sticker designs (SVG-based cute reaction stickers)
export const ART_STICKERS: { id: string; label: string; svg: string }[] = [
  {
    id: 'heart-rain',
    label: 'ปาหัวใจรัวๆ',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><text x="50" y="35" font-size="22" text-anchor="middle">💖💓💕</text><text x="50" y="65" font-size="14" text-anchor="middle" fill="#E07A5F" font-weight="bold">ปาหัวใจ</text><text x="50" y="80" font-size="14" text-anchor="middle" fill="#E07A5F" font-weight="bold">รัวๆ</text></svg>`,
  },
  {
    id: 'shock-mouth',
    label: 'ค้างมากแม่!',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="40" r="25" fill="#FBE3DC"/><circle cx="42" cy="35" r="4" fill="#2B2B2B"/><circle cx="58" cy="35" r="4" fill="#2B2B2B"/><ellipse cx="50" cy="52" rx="8" ry="12" fill="#2B2B2B"/><text x="50" y="82" font-size="11" text-anchor="middle" fill="#E07A5F" font-weight="bold">ค้างมากแม่!</text></svg>`,
  },
  {
    id: 'cry-heavy',
    label: 'ร้องไห้หนักมาก',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="40" r="25" fill="#FBE3DC"/><path d="M38 35 Q40 38 42 35" stroke="#2B2B2B" stroke-width="2" fill="none"/><path d="M58 35 Q60 38 62 35" stroke="#2B2B2B" stroke-width="2" fill="none"/><path d="M42 50 Q50 55 58 50" stroke="#2B2B2B" stroke-width="2" fill="none"/><path d="M38 48 L36 60" stroke="#5B9BD5" stroke-width="3" stroke-linecap="round"/><path d="M62 48 L64 60" stroke="#5B9BD5" stroke-width="3" stroke-linecap="round"/><text x="50" y="82" font-size="10" text-anchor="middle" fill="#E07A5F" font-weight="bold">ร้องไห้หนักมาก</text></svg>`,
  },
  {
    id: 'fin-jig',
    label: 'ฟินจิกหมอน',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="40" r="25" fill="#FBE3DC"/><path d="M36 35 Q38 32 40 35" stroke="#2B2B2B" stroke-width="2" fill="none"/><path d="M60 35 Q62 32 64 35" stroke="#2B2B2B" stroke-width="2" fill="none"/><path d="M42 50 Q50 48 58 50" stroke="#E07A5F" stroke-width="2.5" fill="none"/><text x="30" y="25" font-size="12" fill="#E07A5F">✨</text><text x="65" y="30" font-size="10" fill="#E07A5F">💫</text><text x="50" y="82" font-size="11" text-anchor="middle" fill="#E07A5F" font-weight="bold">ฟินจิกหมอน</text></svg>`,
  },
  {
    id: 'wait-next',
    label: 'รอตอนต่อไป',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="40" r="25" fill="#FBE3DC"/><circle cx="42" cy="35" r="4" fill="#2B2B2B"/><circle cx="58" cy="35" r="4" fill="#2B2B2B"/><path d="M42 50 Q50 53 58 50" stroke="#2B2B2B" stroke-width="2" fill="none"/><text x="50" y="72" font-size="10" text-anchor="middle" fill="#E07A5F">⏳</text><text x="50" y="85" font-size="9" text-anchor="middle" fill="#E07A5F" font-weight="bold">รอตอนต่อไป</text></svg>`,
  },
  {
    id: 'pay-rain',
    label: 'เปย์รัวๆ',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><text x="50" y="30" font-size="16" text-anchor="middle">💰💵💸</text><circle cx="50" cy="55" r="18" fill="#FBE3DC"/><circle cx="44" cy="52" r="3" fill="#2B2B2B"/><circle cx="56" cy="52" r="3" fill="#2B2B2B"/><path d="M44 62 Q50 65 56 62" stroke="#E07A5F" stroke-width="2" fill="none"/><text x="50" y="88" font-size="11" text-anchor="middle" fill="#E07A5F" font-weight="bold">เปย์รัวๆ</text></svg>`,
  },
  {
    id: 'support',
    label: 'สู้ๆนะ',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="38" r="22" fill="#FBE3DC"/><circle cx="43" cy="34" r="3" fill="#2B2B2B"/><circle cx="57" cy="34" r="3" fill="#2B2B2B"/><path d="M43 45 Q50 50 57 45" stroke="#2B2B2B" stroke-width="2" fill="none"/><text x="35" y="70" font-size="16" fill="#E07A5F">💪</text><text x="50" y="85" font-size="11" text-anchor="middle" fill="#E07A5F" font-weight="bold">สู้ๆนะ</text></svg>`,
  },
  {
    id: 'love-story',
    label: 'รักเรื่องนี้',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><text x="50" y="30" font-size="20" text-anchor="middle">📚❤️</text><circle cx="50" cy="58" r="18" fill="#FBE3DC"/><circle cx="44" cy="55" r="3" fill="#2B2B2B"/><circle cx="56" cy="55" r="3" fill="#2B2B2B"/><path d="M42 65 Q50 68 58 65" stroke="#E07A5F" stroke-width="2" fill="none"/><text x="50" y="90" font-size="10" text-anchor="middle" fill="#E07A5F" font-weight="bold">รักเรื่องนี้</text></svg>`,
  },
];

// AI cover style presets
export const COVER_STYLES: { id: string; label: string; promptSuffix: string }[] = [
  { id: 'anime', label: 'อนิเมะ/มังฮวาเกาหลี', promptSuffix: 'anime manhwa style, vibrant colors, beautiful illustration, korean web novel cover' },
  { id: 'chinese', label: 'จีนโบราณสีน้ำ', promptSuffix: 'traditional chinese ink painting style, watercolor, elegant, ancient palace aesthetic' },
  { id: 'dark', label: 'แฟนตาซีดาร์ก/วันสิ้นโลก', promptSuffix: 'dark fantasy apocalyptic style, dramatic lighting, cinematic, moody atmosphere' },
  { id: 'romantic', label: 'โรแมนติกละมุน', promptSuffix: 'soft romantic watercolor style, pastel colors, dreamy, gentle and warm' },
];

// Fallback cover artworks (using pollinations with preset prompts for instant loading)
export const FALLBACK_COVERS: string[] = [
  `https://image.pollinations.ai/prompt/beautiful%20anime%20boy%20school%20uniform%20looking%20at%20stars%20night%20sky%20vertical%20book%20cover%20illustration?width=600&height=900&nologo=true&seed=101`,
  `https://image.pollinations.ai/prompt/apocalyptic%20city%20flooded%20tsunami%20survivor%20silhouette%20dramatic%20vertical%20book%20cover?width=600&height=900&nologo=true&seed=202`,
  `https://image.pollinations.ai/prompt/ancient%20thai%20palace%20woman%20traditional%20dress%20historical%20elegant%20vertical%20book%20cover?width=600&height=900&nologo=true&seed=303`,
  `https://image.pollinations.ai/prompt/flower%20shop%20rainy%20day%20romantic%20soft%20pastel%20watercolor%20vertical%20book%20cover?width=600&height=900&nologo=true&seed=404`,
  `https://image.pollinations.ai/prompt/dark%20fantasy%20mystery%20forest%20fog%20moody%20atmosphere%20vertical%20book%20cover%20illustration?width=600&height=900&nologo=true&seed=505`,
  `https://image.pollinations.ai/prompt/martial%20arts%20action%20warrior%20dynamic%20pose%20dramatic%20vertical%20book%20cover?width=600&height=900&nologo=true&seed=606`,
];

export const TIPS: { amount: number; label: string; emoji: string }[] = [
  { amount: 10, label: 'ชานม', emoji: '🧋' },
  { amount: 20, label: 'กำลังใจ', emoji: '💪' },
  { amount: 50, label: 'ช่อดอกไม้', emoji: '💐' },
];

export const AVATAR_COLORS = [
  '#E07A5F',
  '#81B29A',
  '#2C5F7C',
  '#7C5E3C',
  '#8E9B6E',
  '#B5838D',
  '#6B9080',
  '#A4937C',
];

export function getInitialState(): AppState {
  return {
    stories: STORIES,
    bookmarks: ['story-retro-001'],
    comments: [
      {
        id: 'c1',
        chapterId: 'bl-c1',
        author: 'นักอ่านตัวยง',
        avatarColor: '#81B29A',
        text: 'ตอนเปิดเรื่องสุดยอดมาก รอตอนต่อไป!',
        isSticker: false,
        createdAt: now - 3600000,
      },
      {
        id: 'c2',
        chapterId: 'bl-c1',
        author: 'แฟนนิยาย',
        avatarColor: '#B5838D',
        text: '😱',
        isSticker: true,
        stickerType: 'emoji',
        createdAt: now - 1800000,
      },
      {
        id: 'c3',
        chapterId: 'sur-c1',
        author: 'ผู้อ่านเงียบ',
        avatarColor: '#2C5F7C',
        text: 'ตื่นเต้นมาก นั่งอ่านจนลืมนอน',
        isSticker: false,
        createdAt: now - 7200000,
      },
    ],
    tips: [
      { id: 't1', chapterId: 'bl-c1', amount: 20, label: 'กำลังใจ', donor: 'แฟนนิยาย', createdAt: now - 5400000 },
    ],
    progress: [
      { storyId: 'story-bl-001', chapterId: 'bl-c2', percent: 75, updatedAt: now - 3600000 },
      { storyId: 'story-survival-001', chapterId: 'sur-c1', percent: 40, updatedAt: now - 7200000 },
    ],
    isVIP: false,
    autoRenew: true,
    readingTheme: 'paper',
    fontFamily: 'plex',
    fontSize: 18,
  };
}
