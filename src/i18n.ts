// src/i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    debug: false,
    ns: ["thankyou", "quoteForm"], // both namespaces
    defaultNS: "thankyou",
    interpolation: { escapeValue: false },

    resources: {
      en: {
        thankyou: {
          title: "Thank You!",
          subtitle: "Your quote request has been submitted successfully.",
          formIdLabel: "Form ID:",
          whatNextTitle: "What Happens Next?",
          step1Title: "Email Confirmation",
          step1Desc: "You'll receive a detailed quotation in your email within the next 15 minutes.",
          step2Title: "Review & Reserve",
          step2Desc: "Review the quotation and follow the link to reserve your storage unit.",
          step3Title: "Move In",
          step3Desc: "Complete your booking and move in at your convenience.",
          submitAnother: "Submit Another Quote",
          closeWindow: "Close Window"
        },
        quoteForm: {
          title: "Get a Quote",
          subtitle: "Fill in your storage requirements to receive a personalized quote",
          storageRequirements: "Storage Requirements",
          facility: "Storage Facility",
          unitType: "Storage Unit Type",
          unitSize: "Storage Size",
          duration: "Storage Duration",
          moveInDate: "Move In Date",
          name: "Name",
          email: "Email",
          contact: "Contact Number",
          promoCode: "Promo Code (Optional)",
          addCode: "Add Code",
          appliedCodes: "Applied codes:",
          submit: "Submit Quote Request",
          submitting: "Submitting..."
        }
      },

      ko: {
        thankyou: {
          title: "감사합니다!",
          subtitle: "견적 요청이 성공적으로 제출되었습니다.",
          formIdLabel: "양식 ID:",
          whatNextTitle: "다음 단계",
          step1Title: "이메일 확인",
          step1Desc: "15분 이내에 이메일로 상세 견적을 받게 됩니다.",
          step2Title: "검토 및 예약",
          step2Desc: "견적을 검토하고 링크를 따라 보관 공간을 예약하세요.",
          step3Title: "입주",
          step3Desc: "예약을 완료하고 편한 시간에 입주하세요.",
          submitAnother: "다른 견적 제출",
          closeWindow: "창 닫기"
        },
        quoteForm: {
          title: "견적 요청",
          subtitle: "보관 요구 사항을 입력하여 맞춤 견적을 받아보세요",
          storageRequirements: "보관 요구 사항",
          facility: "보관 시설",
          unitType: "보관 유닛 유형",
          unitSize: "보관 크기",
          duration: "보관 기간",
          moveInDate: "입주 날짜",
          name: "이름",
          email: "이메일",
          contact: "연락처 번호",
          promoCode: "프로모션 코드 (선택 사항)",
          addCode: "코드 추가",
          appliedCodes: "적용된 코드:",
          submit: "견적 요청 제출",
          submitting: "제출 중..."
        }
      },

      "zh-CN": {
        thankyou: {
          title: "谢谢！",
          subtitle: "您的报价请求已提交成功。",
          formIdLabel: "表单编号：",
          whatNextTitle: "接下来会发生什么？",
          step1Title: "邮件确认",
          step1Desc: "您将在15分钟内通过电子邮件收到详细报价。",
          step2Title: "查看并预订",
          step2Desc: "查看报价并通过链接预订您的储存单元。",
          step3Title: "搬入",
          step3Desc: "完成预订并在方便的时间搬入。",
          submitAnother: "提交另一个报价",
          closeWindow: "关闭窗口"
        },
        quoteForm: {
          title: "获取报价",
          subtitle: "填写您的存储需求以获取个性化报价",
          storageRequirements: "存储要求",
          facility: "存储设施",
          unitType: "存储单元类型",
          unitSize: "存储大小",
          duration: "存储时长",
          moveInDate: "搬入日期",
          name: "姓名",
          email: "电子邮件",
          contact: "联系电话",
          promoCode: "优惠码 (可选)",
          addCode: "添加代码",
          appliedCodes: "已应用代码：",
          submit: "提交报价请求",
          submitting: "提交中..."
        }
      },

      "zh-TW": {
        thankyou: {
          title: "謝謝！",
          subtitle: "您的報價請求已成功送出。",
          formIdLabel: "表單編號：",
          whatNextTitle: "接下來會發生什麼？",
          step1Title: "Email 確認",
          step1Desc: "您會在 15 分鐘內在電子郵件收到詳細報價。",
          step2Title: "檢視並預訂",
          step2Desc: "檢視報價並透過連結預訂您的儲存單元。",
          step3Title: "入住",
          step3Desc: "完成預訂並在方便的時間入住。",
          submitAnother: "再次提交報價",
          closeWindow: "關閉視窗"
        },
        quoteForm: {
          title: "取得報價",
          subtitle: "填寫您的儲存需求以獲取個人化報價",
          storageRequirements: "儲存需求",
          facility: "儲存設施",
          unitType: "儲存單元類型",
          unitSize: "儲存大小",
          duration: "儲存期間",
          moveInDate: "搬入日期",
          name: "姓名",
          email: "電子郵件",
          contact: "聯絡電話",
          promoCode: "優惠代碼 (選填)",
          addCode: "新增代碼",
          appliedCodes: "已套用的代碼：",
          submit: "提交報價申請",
          submitting: "提交中..."
        }
      }
    },

    detection: {
      order: ["querystring", "localStorage", "navigator"],
      caches: ["localStorage"]
    }
  });

export default i18n;
