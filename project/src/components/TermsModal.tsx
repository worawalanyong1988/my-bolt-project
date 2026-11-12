import { useEffect, useState } from 'react';
import { Modal } from '@/components/Modal';

export type TermsTab = 'general' | 'vip';

interface TermsModalProps {
  open: boolean;
  onClose: () => void;
  initialTab?: TermsTab;
  onAccept?: () => void;
}

export function TermsModal({ open, onClose, initialTab = 'general', onAccept }: TermsModalProps) {
  const [activeTab, setActiveTab] = useState<TermsTab>(initialTab);

  useEffect(() => {
    if (open) setActiveTab(initialTab);
  }, [initialTab, open]);

  return (
    <Modal open={open} onClose={onClose} title="ข้อตกลงและเงื่อนไขการใช้งาน" maxWidth="max-w-2xl">
      <div>
        <div
          role="tablist"
          aria-label="หมวดข้อตกลง"
          className="sticky top-0 z-10 -mx-5 -mt-5 mb-4 flex border-b border-cream-200 bg-cream-50 px-5 pt-2"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'general'}
            onClick={() => setActiveTab('general')}
            className={`flex-1 border-b-2 px-2 py-3 text-xs font-bold sm:text-sm ${
              activeTab === 'general'
                ? 'border-terracotta-500 text-terracotta-600'
                : 'border-transparent text-charcoal-muted'
            }`}
          >
            ข้อตกลงการใช้งานทั่วไป
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'vip'}
            onClick={() => setActiveTab('vip')}
            className={`flex-1 border-b-2 px-2 py-3 text-xs font-bold sm:text-sm ${
              activeTab === 'vip'
                ? 'border-terracotta-500 text-terracotta-600'
                : 'border-transparent text-charcoal-muted'
            }`}
          >
            สมาชิก VIP และคอยน์
          </button>
        </div>

        <div
          role="tabpanel"
          className="max-h-[65vh] space-y-5 overflow-y-auto pr-1 text-sm leading-7 text-charcoal"
        >
          {activeTab === 'general' ? <GeneralTerms /> : <VipTerms />}
          <p className="border-t border-cream-200 pt-3 text-xs leading-relaxed text-charcoal-muted">
            ข้อกำหนดนี้มีผลตั้งแต่วันที่ประกาศ Aksara อาจปรับปรุงข้อกำหนดโดยแจ้งผ่านแอปหรือเว็บไซต์
            หากมีข้อสงสัยหรือประสงค์ใช้สิทธิเกี่ยวกับข้อมูลส่วนบุคคล โปรดติดต่อผ่านช่องทางช่วยเหลือของ Aksara
          </p>
        </div>
        {onAccept && (
          <button
            type="button"
            onClick={onAccept}
            className="mt-4 w-full rounded-xl bg-terracotta-500 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-terracotta-600 focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:ring-offset-2"
          >
            ฉันได้อ่านและยอมรับเงื่อนไขทั้งหมด
          </button>
        )}
      </div>
    </Modal>
  );
}

function GeneralTerms() {
  return (
    <>
      <h3 className="text-base font-extrabold text-charcoal">ข้อตกลงและเงื่อนไขการใช้งานทั่วไป</h3>
      <TermsSection title="1. ขอบเขตการให้บริการ">
        Aksara เป็นแพลตฟอร์มสำหรับเผยแพร่อ่านนิยายและวรรณกรรมออนไลน์ ผู้ใช้ต้องให้ข้อมูลสมัครสมาชิกที่ถูกต้อง
        เป็นปัจจุบัน และไม่แอบอ้างบุคคลอื่น ผู้ใช้มีหน้าที่เก็บรักษารหัสผ่านและข้อมูลเข้าสู่ระบบเป็นความลับ
        และรับผิดชอบต่อกิจกรรมที่เกิดขึ้นผ่านบัญชีของตน หากพบการใช้งานโดยไม่ได้รับอนุญาต โปรดแจ้ง Aksara โดยเร็ว
        Aksara อาจปรับปรุงหรือระงับบริการบางส่วนเพื่อบำรุงรักษา ความปลอดภัย หรือเหตุจำเป็นในการให้บริการ
      </TermsSection>

      <TermsSection title="2. ทรัพย์สินทางปัญญาและลิขสิทธิ์">
        เนื้อหานิยายและผลงานที่ผู้เขียนเผยแพร่เป็นลิขสิทธิ์ของผู้เขียนหรือเจ้าของสิทธิ์
        ส่วนซอฟต์แวร์ เครื่องหมายการค้า งานออกแบบ และองค์ประกอบของแพลตฟอร์มเป็นสิทธิ์ของผู้ให้บริการหรือผู้อนุญาต
        ภายใต้พระราชบัญญัติลิขสิทธิ์ พ.ศ. 2537 และที่แก้ไขเพิ่มเติม ห้ามคัดลอก ดัดแปลง บันทึกภาพหน้าจอ
        เผยแพร่ซ้ำ หรือใช้เนื้อหาและองค์ประกอบเพื่อการค้าโดยไม่ได้รับอนุญาตจากเจ้าของสิทธิ์
        ผู้ให้บริการอาจระงับหรือยกเลิกบัญชีเมื่อพบการละเมิด และสงวนสิทธิ์ดำเนินการตามกฎหมาย
        ทั้งนี้ การระงับบัญชีไม่ตัดสิทธิหรือข้อยกเว้นใดที่กฎหมายกำหนด
      </TermsSection>

      <TermsSection title="3. มารยาทการแสดงความคิดเห็น">
        ห้ามโพสต์ข้อความหมิ่นประมาท หยาบคาย คุกคาม ข่มขู่ สแปม ละเมิดสิทธิผู้อื่น
        หรือมีเนื้อหาที่ฝ่าฝืนกฎหมาย รวมถึงพระราชบัญญัติว่าด้วยการกระทำความผิดเกี่ยวกับคอมพิวเตอร์
        ผู้ให้บริการมีสิทธิซ่อนหรือลบเนื้อหา และจำกัดหรือระงับบัญชีได้โดยไม่ต้องแจ้งล่วงหน้า
        ตามความเหมาะสมของกรณีและภายใต้กฎหมายที่ใช้บังคับ
      </TermsSection>

      <TermsSection title="4. ข้อมูลส่วนบุคคลและความเป็นส่วนตัว">
        Aksara ประมวลผลข้อมูลที่จำเป็นต่อการให้บริการ เช่น อีเมล ชื่อและข้อมูลโปรไฟล์
        ประวัติการอ่าน การใช้งาน ความคิดเห็น และธุรกรรม เพื่อให้บริการ ซิงก์บัญชี รักษาความปลอดภัย
        และปรับปรุงระบบ ข้อมูลอาจถูกประมวลผลโดยผู้ให้บริการระบบที่จำเป็นต่อการทำงานของแพลตฟอร์ม
        หรือเปิดเผยเมื่อกฎหมายกำหนด โดยจะไม่ขายข้อมูลส่วนบุคคลหรือเปิดเผยเพื่อวัตถุประสงค์อื่นโดยไม่ได้รับความยินยอม
        ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 ผู้ใช้อาจติดต่อ Aksara เพื่อสอบถามหรือใช้สิทธิ
        เกี่ยวกับข้อมูลส่วนบุคคลได้ผ่านช่องทางช่วยเหลือในแอป
      </TermsSection>
    </>
  );
}

function VipTerms() {
  return (
    <>
      <h3 className="text-base font-extrabold text-charcoal">เงื่อนไขการสมัครสมาชิก VIP และระบบคอยน์</h3>
      <TermsSection title="1. สิทธิประโยชน์สมาชิก VIP">
        สมาชิก VIP เป็นบริการรายเดือน รอบละ 30 วัน โดยเริ่มนับเมื่อระบบยืนยันการชำระเงินและเปิดสิทธิ์แล้ว
        สมาชิกสามารถอ่านตอนพิเศษที่กำหนดให้เป็นสิทธิ์ VIP บนแพลตฟอร์มได้ตลอดช่วงสมาชิก
        สิทธิ์นี้เป็นการเข้าถึงตามระยะเวลา ไม่ใช่การซื้อขาดรายตอน
        ราคาและรายละเอียดแพ็กเกจที่ใช้บังคับจะแสดงก่อนยืนยันรายการ
      </TermsSection>

      <TermsSection title="2. การชำระเงินและการคืนเงิน">
        เมื่อระบบยืนยันการชำระเงินและเปิดสิทธิ์ VIP แล้ว รายการดังกล่าวไม่สามารถขอคืนเงินได้
        เว้นแต่เกิดความผิดพลาดทางเทคนิคของระบบชำระเงินหรือกฎหมายกำหนดไว้เป็นอย่างอื่น
        หากพบการเรียกเก็บเงินผิดพลาด โปรดติดต่อ Aksara พร้อมรายละเอียดรายการเพื่อให้ตรวจสอบ
        การต่ออายุหรือการเรียกเก็บเงินรอบถัดไปจะเป็นไปตามรายละเอียดที่แสดงก่อนยืนยันการชำระเงิน
      </TermsSection>

      <TermsSection title="3. เงื่อนไขเหรียญคอยน์สะสม (VIP Loyalty Coins)">
        เมื่อระบบยืนยันการชำระเงินสมัครหรือต่ออายุ VIP สำเร็จ 1 ครั้ง สมาชิกจะได้รับโบนัส 5 คอยน์
        เมื่อสะสมครบ 100 คอยน์ สามารถแลกส่วนลด 20% สำหรับค่าสมาชิก VIP ในรอบบิลถัดไปได้
        โดยระบบจะหัก 100 คอยน์เมื่อยืนยันการแลก คอยน์ไม่สามารถแลกเป็นเงินสด โอนให้บัญชีอื่น
        หรือขอคืนเป็นเงินได้ และไม่สามารถใช้ร่วมกับสิทธิประโยชน์อื่น เว้นแต่ระบุไว้เป็นอย่างอื่น
        Aksara อาจตรวจสอบหรือระงับคอยน์ที่ได้มาจากรายการทุจริตหรือรายการที่ถูกยกเลิก
      </TermsSection>

      <TermsSection title="4. การเปลี่ยนแปลงราคาและเงื่อนไข">
        Aksara ขอสงวนสิทธิ์ปรับราคาแพ็กเกจหรือเงื่อนไขโปรโมชัน โดยจะแจ้งให้ทราบล่วงหน้าผ่านแอปหรือเว็บไซต์
        การเปลี่ยนแปลงจะไม่กระทบระยะเวลาสมาชิกที่ชำระเงินและเปิดสิทธิ์ไปแล้ว
        เว้นแต่จำเป็นต้องเปลี่ยนแปลงเพื่อให้เป็นไปตามกฎหมายหรือเพื่อความปลอดภัยของบริการ
      </TermsSection>
    </>
  );
}

function TermsSection({ title, children }: { title: string; children: string }) {
  return (
    <section>
      <h4 className="font-bold text-charcoal">{title}</h4>
      <p className="mt-1 text-charcoal-muted">{children}</p>
    </section>
  );
}
