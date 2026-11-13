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
  return { id, number, title, content, access, status, readCount: 0, createdAt: now - offset };
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
  readCount: 0,
  likeCount: 0,
  bookmarkCount: 0,
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
  readCount: 0,
  likeCount: 0,
  bookmarkCount: 0,
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
  readCount: 0,
  likeCount: 0,
  bookmarkCount: 0,
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
  readCount: 0,
  likeCount: 0,
  bookmarkCount: 0,
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

function makeAksaraSticker(expression: string, accents = ''): string {
  return `<svg viewBox="0 0 120 120" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <path d="M60 4a50 50 0 1 0 0 100 50 50 0 0 0 0-100Z" fill="#FFF4D8"/>
    ${accents}
    <path d="M77 83c18-1 22 17 10 21-7 2-10-4-7-8" fill="none" stroke="#D97845" stroke-width="6" stroke-linecap="round"/>
    <path d="M34 77c-8 9-5 24 6 29h40c11-5 14-20 6-29Z" fill="#F28C52" stroke="#C9634A" stroke-width="2"/>
    <path d="M46 81c4 8 24 8 28 0v24H46Z" fill="#FFF7E9"/>
    <path d="M30 48 23 19l27 15M69 34l28-15-8 31" fill="#F28C52" stroke="#C9634A" stroke-width="3" stroke-linejoin="round"/>
    <path d="m31 39-2-12 12 7m37 5 12-8-3 15" fill="#F6B5A2"/>
    <ellipse cx="60" cy="54" rx="35" ry="31" fill="#F28C52" stroke="#C9634A" stroke-width="2"/>
    <path d="M34 59c3-13 15-20 26-20s23 7 26 20c-4 14-15 21-26 21S38 73 34 59Z" fill="#FFF2DF"/>
    <path d="M49 32q11-10 22 0" fill="none" stroke="#D97845" stroke-width="5" stroke-linecap="round"/>
    ${expression}
    <path d="M41 101q-9-9-15-2c-4 6 2 11 15 11m38-9q9-9 15-2c4 6-2 11-15 11" fill="#FFF2DF" stroke="#C9634A" stroke-width="2" stroke-linecap="round"/>
  </svg>`;
}

// Original Aksara cat mascot stickers, drawn as inline vector artwork.
export const ART_STICKERS: { id: string; label: string; svg: string }[] = [
  {
    id: 'laugh-out',
    label: 'ขำไม่ไหว',
    svg: makeAksaraSticker(
      `<path d="M43 51q6-8 12 0m10 0q6-8 12 0" fill="none" stroke="#56392E" stroke-width="3" stroke-linecap="round"/><path d="M49 61q11-4 22 0-2 13-11 13t-11-13Z" fill="#7B3743"/><path d="M55 64h10v4H55Z" fill="#fff"/>`,
      `<path d="m24 48-10-5m81 5 10-5m-8 22 8 3M20 67l-8 3" stroke="#F0A72F" stroke-width="4" stroke-linecap="round"/><path d="m22 34 4 5m67-5-4 5" stroke="#70B7D6" stroke-width="4" stroke-linecap="round"/>`,
    ),
  },
  {
    id: 'cry-heavy',
    label: 'ตับพัง ดราม่าหนักมาก',
    svg: makeAksaraSticker(
      `<path d="M43 50q5 6 10 0m12 0q5 6 10 0" fill="none" stroke="#56392E" stroke-width="3" stroke-linecap="round"/><path d="M53 66q7-7 14 0-7 9-14 0Z" fill="#7B3743"/><path d="M42 54c-8 12-8 18 0 18s8-6 0-18m36 0c-8 12-8 18 0 18s8-6 0-18" fill="#69C9ED" stroke="#2D9FCB" stroke-width="2"/><path d="M51 83q9 7 18 0" fill="none" stroke="#69C9ED" stroke-width="3" stroke-linecap="round"/>`,
      `<path d="M17 81q8-11 16 0t16 0m20 0q8-11 16 0t16 0" fill="none" stroke="#69C9ED" stroke-width="4" stroke-linecap="round"/>`,
    ),
  },
  {
    id: 'blushing',
    label: 'ฟินจิกหมอน',
    svg: makeAksaraSticker(
      `<path d="M43 52q5-7 10 0m12 0q5-7 10 0" fill="none" stroke="#56392E" stroke-width="3" stroke-linecap="round"/><circle cx="43" cy="61" r="6" fill="#F28B91" opacity=".8"/><circle cx="77" cy="61" r="6" fill="#F28B91" opacity=".8"/><path d="M54 63q6 8 12 0" fill="none" stroke="#B65353" stroke-width="3" stroke-linecap="round"/>`,
      `<path d="m25 39 3-7 3 7 7 3-7 3-3 7-3-7-7-3Zm64 2 2-5 2 5 5 2-5 2-2 5-2-5-5-2Z" fill="#FFCF5A"/><path d="m30 69-5 5m71-8 5 5" stroke="#F28B91" stroke-width="3" stroke-linecap="round"/>`,
    ),
  },
  {
    id: 'angry-reader',
    label: 'หยุมหัวตัวร้าย',
    svg: makeAksaraSticker(
      `<path d="m42 47 12 5m24-5-12 5" stroke="#56392E" stroke-width="4" stroke-linecap="round"/><ellipse cx="49" cy="57" rx="3" ry="5" fill="#56392E"/><ellipse cx="71" cy="57" rx="3" ry="5" fill="#56392E"/><path d="M54 70q6-7 12 0" fill="none" stroke="#9E3D38" stroke-width="3" stroke-linecap="round"/>`,
      `<path d="M30 24c-9-8-17 2-8 10-8 7 1 16 9 8 7 8 16-1 8-9 8-8-1-16-9-9Z" fill="#F27B57"/><path d="M92 25c-7-8-15 0-8 7-7 7 1 14 8 7 7 7 14-1 7-8 7-7-1-14-7-6Z" fill="#F6A23D"/><path d="M19 54h9m64 0h9" stroke="#E66A4E" stroke-width="4" stroke-linecap="round"/>`,
    ),
  },
  {
    id: 'shock-mouth',
    label: 'หักมุมเกินไป!',
    svg: makeAksaraSticker(
      `<ellipse cx="49" cy="52" rx="7" ry="10" fill="#fff" stroke="#56392E" stroke-width="2"/><ellipse cx="71" cy="52" rx="7" ry="10" fill="#fff" stroke="#56392E" stroke-width="2"/><circle cx="50" cy="55" r="3" fill="#56392E"/><circle cx="70" cy="55" r="3" fill="#56392E"/><ellipse cx="60" cy="69" rx="6" ry="9" fill="#7B3743"/>`,
      `<path d="m25 30 5-8 5 8 9 2-7 6 1 9-8-5-8 5 2-9-7-6Zm66 7 3-6 4 6 7 1-5 5 1 7-7-4-6 4 1-7-5-5Z" fill="#FFCB55"/>`,
    ),
  },
  {
    id: 'thumbsup',
    label: 'เอาไปเลยเต็มสิบ',
    svg: makeAksaraSticker(
      `<path d="M43 53q6-5 11 1m11-1q6-5 11 1" fill="none" stroke="#56392E" stroke-width="3" stroke-linecap="round"/><path d="M53 65q7 8 14 0" fill="none" stroke="#B65353" stroke-width="3" stroke-linecap="round"/><path d="M85 76V58q0-5 5-5t5 5v8l4-3q5-3 7 2 1 3-2 6l-9 12H84Z" fill="#FFD29A" stroke="#C9634A" stroke-width="2" stroke-linejoin="round"/>`,
      `<path d="m25 44 3-7 3 7 7 3-7 3-3 7-3-7-7-3Zm66-23 2-5 2 5 5 2-5 2-2 5-2-5-5-2Z" fill="#FFCB55"/><text x="60" y="96" text-anchor="middle" font-size="10" font-weight="bold" fill="#C9634A">10/10</text>`,
    ),
  },
  {
    id: 'wai-thanks',
    label: 'กราบไรท์เตอร์',
    svg: makeAksaraSticker(
      `<path d="M43 51q5-5 10 0m14 0q5-5 10 0" fill="none" stroke="#56392E" stroke-width="3" stroke-linecap="round"/><path d="M54 66q6 6 12 0" fill="none" stroke="#B65353" stroke-width="3" stroke-linecap="round"/><path d="M58 74 48 64q-4-4-7 0-2 3 1 6l16 15 16-15q3-3 0-6-3-3-7 0L60 74" fill="#FFD29A" stroke="#C9634A" stroke-width="2" stroke-linejoin="round"/>`,
      `<path d="m27 28 3-7 3 7 7 3-7 3-3 7-3-7-7-3Zm60 3 2-5 2 5 5 2-5 2-2 5-2-5-5-2Z" fill="#FFCB55"/>`,
    ),
  },
  {
    id: 'heart-rain',
    label: 'คลั่งรักเรื่องนี้',
    svg: makeAksaraSticker(
      `<path d="M43 52q6-8 12 0m10 0q6-8 12 0" fill="none" stroke="#56392E" stroke-width="3" stroke-linecap="round"/><path d="M52 64q8 11 16 0" fill="none" stroke="#B65353" stroke-width="3" stroke-linecap="round"/>`,
      `<path d="M28 34c-7-8-17 1-8 9l8 7 8-7c9-8-1-17-8-9Zm63-13c-5-6-13 1-7 7l7 6 7-6c6-6-2-13-7-7ZM23 70c-5-6-13 1-7 7l7 6 7-6c6-6-2-13-7-7Zm75-13c-5-6-13 1-7 7l7 6 7-6c6-6-2-13-7-7Z" fill="#F27691"/><path d="m48 28 3-6 3 6 6 3-6 3-3 6-3-6-6-3Z" fill="#FFCB55"/>`,
    ),
  },
  {
    id: 'pleading',
    label: 'มาต่อเร็วๆ น้า',
    svg: makeAksaraSticker(
      `<ellipse cx="49" cy="52" rx="7" ry="9" fill="#fff" stroke="#56392E" stroke-width="2"/><ellipse cx="71" cy="52" rx="7" ry="9" fill="#fff" stroke="#56392E" stroke-width="2"/><circle cx="50" cy="54" r="3" fill="#56392E"/><circle cx="70" cy="54" r="3" fill="#56392E"/><circle cx="47" cy="49" r="2" fill="#fff"/><circle cx="68" cy="49" r="2" fill="#fff"/><path d="M55 68q5-5 10 0" fill="none" stroke="#B65353" stroke-width="3" stroke-linecap="round"/>`,
      `<path d="M26 50c-7 11-7 16 0 16s7-5 0-16m69 0c-7 11-7 16 0 16s7-5 0-16" fill="#69C9ED" stroke="#2D9FCB" stroke-width="2"/><path d="M42 36q7-7 14 0m8 0q7-7 14 0" fill="none" stroke="#C9634A" stroke-width="2.5" stroke-linecap="round"/>`,
    ),
  },
  {
    id: 'cheer-team',
    label: 'ทีมพระเอก/นายเอก',
    svg: makeAksaraSticker(
      `<path d="M43 51q6-7 12 0m10 0q6-7 12 0" fill="none" stroke="#56392E" stroke-width="3" stroke-linecap="round"/><path d="M53 64q7 9 14 0" fill="none" stroke="#B65353" stroke-width="3" stroke-linecap="round"/><path d="m40 79-11-15 8-4 15 13m26 6 11-15-8-4-15 13" fill="#FFD29A" stroke="#C9634A" stroke-width="2" stroke-linejoin="round"/><rect x="27" y="6" width="66" height="22" rx="8" fill="#F27691" stroke="#C9634A" stroke-width="2"/><text x="60" y="21" text-anchor="middle" font-size="10" font-weight="bold" fill="#fff">ทีมนี้!</text>`,
      `<path d="m20 33 3-6 3 6 6 2-5 4 1 6-5-3-5 3 1-6-5-4Z M91 38l2-5 2 5 5 2-4 3 1 5-4-2-4 2 1-5-4-3Z" fill="#FFDD70"/>`,
    ),
  },
  {
    id: 'side-eye',
    label: 'หมั่นไส้ตัวอิจฉา',
    svg: makeAksaraSticker(
      `<path d="M42 49q6-3 12 1m10 1q7-8 14-2" fill="none" stroke="#56392E" stroke-width="3" stroke-linecap="round"/><ellipse cx="50" cy="57" rx="3" ry="4" fill="#56392E"/><ellipse cx="72" cy="55" rx="3" ry="4" fill="#56392E"/><path d="M55 70q8-7 15-1" fill="none" stroke="#B65353" stroke-width="3" stroke-linecap="round"/>`,
      `<path d="M21 32q12-10 21 0M75 32q12-10 21 0" fill="none" stroke="#56392E" stroke-width="3" stroke-linecap="round"/><path d="m91 62 4-5 4 5 6 2-5 4 1 6-6-3-5 3 1-6-5-4Z" fill="#F27B57"/>`,
    ),
  },
  {
    id: 'sleepy-reader',
    label: 'อ่านโต้รุ่งจนเช้า',
    svg: makeAksaraSticker(
      `<path d="M43 54q5-5 10 0m12 0q5-5 10 0" fill="none" stroke="#56392E" stroke-width="3" stroke-linecap="round"/><path d="M55 68q5-3 10 0" fill="none" stroke="#B65353" stroke-width="3" stroke-linecap="round"/><path d="M78 63q10 5 4 12" fill="none" stroke="#69C9ED" stroke-width="3" stroke-linecap="round"/><path d="M35 41q7-5 14 0" fill="none" stroke="#56392E" stroke-width="3" stroke-linecap="round"/>`,
      `<path d="M83 18h20v5L90 35h13v6H81v-5l13-12H83Zm-65 4h15v4l-10 8h10v5H17v-4l10-8h-9Z" fill="#7F9ED4"/><path d="M22 80q7-8 15 0" fill="none" stroke="#69C9ED" stroke-width="4" stroke-linecap="round"/>`,
    ),
  },
];

// AI cover style presets
export const COVER_STYLES: { id: string; label: string; promptSuffix: string }[] = [
  { id: 'anime', label: 'อนิเมะ/มังฮวาเกาหลี', promptSuffix: 'anime manhwa style, vibrant colors, beautiful illustration, korean web novel cover' },
  { id: 'chinese', label: 'จีนโบราณสีน้ำ', promptSuffix: 'traditional chinese ink painting style, watercolor, elegant, ancient palace aesthetic' },
  { id: 'dark', label: 'แฟนตาซีดาร์ก/วันสิ้นโลก', promptSuffix: 'dark fantasy apocalyptic style, dramatic lighting, cinematic, moody atmosphere' },
  { id: 'romantic', label: 'โรแมนติกละมุน', promptSuffix: 'soft romantic watercolor style, pastel colors, dreamy, gentle and warm' },
];

export const DONATION_STICKERS = [
  { id: 'bubble-tea', label: 'ชานมไข่มุก', emoji: '🧋', amount: 9 },
  { id: 'toast', label: 'ขนมปังปิ้ง', emoji: '🍞', amount: 19 },
  { id: 'morning-coffee', label: 'กาแฟยามเช้า', emoji: '☕', amount: 29 },
  { id: 'flower-bouquet', label: 'ช่อดอกไม้', emoji: '💐', amount: 59 },
  { id: 'teddy-bear', label: 'ตุ๊กตาหมี', emoji: '🧸', amount: 99 },
  { id: 'princess-crown', label: 'มงกุฎเจ้าหญิง', emoji: '👑', amount: 199 },
  { id: 'sports-car', label: 'รถสปอร์ตสุดหรู', emoji: '🏎️', amount: 499 },
  { id: 'mansion', label: 'คฤหาสน์หรู', emoji: '🏰', amount: 999 },
  { id: 'rocket', label: 'จรวดทะยานฟ้า', emoji: '🚀', amount: 1999 },
] as const;

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
    bookmarks: [],
    likedStories: [],
    comments: [],
    tips: [],
    progress: [],
    vipSubscriptions: [],
    writerNotifications: [],
    profile: {
      displayName: 'คุณ',
      bio: 'นักอ่านและนักเขียน',
    },
    isVIP: false,
    autoRenew: true,
    coins: 0,
    hasNextMonthDiscount: false,
    transactions: [],
    readingTheme: 'paper',
    fontFamily: 'plex',
    fontSize: 18,
  };
}
