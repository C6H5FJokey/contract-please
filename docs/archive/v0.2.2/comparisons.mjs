export const directions = [
  { id: "calculation", text: "这项待遇怎么计算？" },
  { id: "conditions", text: "在什么情况下会变？" },
  { id: "responsibility", text: "谁安排，谁负责？" },
  { id: "scope", text: "适用哪些人和哪些情况？" },
  { id: "writing", text: "能把执行口径给我看一下吗？" },
];

export const requests = [
  { id: "explain", text: "只问原因", detail: "请 HR 解释原文，合同照旧。" },
  {
    id: "clarify",
    text: "把现有条件写清楚",
    detail: "把实际发放方式写进合同，待遇按现有条件执行。",
  },
  {
    id: "amend",
    text: "协商改变条件",
    detail: "要求调整金额、发放门槛或其他条款。谈成后才有新稿。",
  },
];

const quote = (source, fragment) => ({ source, fragment });
const line = (id, fragment) => quote(`clause:${id}`, fragment);
const file = (id, fragment) => quote(`file:${id}`, fragment);
const interview = (fragment) => quote("interview", fragment);

export const reviews = {
  boshi: {
    interview:
      "周一到周五正常出勤，固定税前 8,000 元。周六有布撤展的话，报酬另算。展务中心就在本市，平时不用跑外地。",
    routes: {
      salary: {
        calculation: ["payroll"],
        conditions: ["payroll", "roster"],
        writing: ["payroll"],
      },
      hours: {
        calculation: ["payroll", "roster"],
        conditions: ["roster"],
        responsibility: ["roster"],
        scope: ["roster"],
        writing: ["roster"],
      },
      role: { responsibility: ["roster"], scope: ["roster"] },
      social: {
        calculation: ["coverage"],
        conditions: ["coverage"],
        scope: ["coverage"],
        writing: ["coverage"],
      },
    },
    directory: ["payroll", "coverage"],
    contextual: {
      issueId: "basePay",
      groups: [
        [line("salary", "税前月度薪酬标准为 8,000 元")],
        [
          file("payroll", "固定工资为 6,800 元"),
          file("payroll", "计入招聘所列的 8,000 元"),
        ],
      ],
      reply:
        "你问的是正文的八千是不是固定工资。按你引用的这份确认单，固定部分是 6,800 元，另外 1,200 元要完成两次周六布撤展才发。两项加起来才是正文里的八千。我承认正文单写一个总数容易误解。",
      negotiationReply:
        "这份稿的八千是固定工资和有条件的津贴加起来的数。要把八千变成正常出勤就能拿到的固定工资，需要调整薪资报价。按这次给你的方案，我可以把固定部分和津贴条件写清楚。",
    },
    comparisons: {
      basePay: {
        groups: [
          [interview("固定税前 8,000 元")],
          [file("payroll", "固定工资为 6,800 元")],
        ],
        explanation:
          "你说的是面试里承诺的固定八千。确认单里的固定部分是六千八，八千是加上项目津贴的口径。之前那句我说得不准确。",
        clarification: {
          reply:
            "我把正常工时固定工资 6,800 元写进正文。周末报酬仍按现行的工时条款和薪酬确认单执行。",
          patches: [
            {
              source: "clause:salary",
              before: "税前月度薪酬标准为 8,000 元。",
              after: "正常工时固定税前工资为 6,800 元。",
            },
          ],
        },
        patches: [
          {
            source: "clause:salary",
            before: "税前月度薪酬标准为 8,000 元。",
            alternative: "正常工时固定税前工资为 6,800 元。",
            after: "正常工时固定税前工资为 7,400 元。",
          },
          {
            source: "file:payroll",
            before: "正常工时固定工资为 6,800 元。",
            after: "正常工时固定工资为 7,400 元。",
          },
        ],
      },
      overtime: {
        groups: [
          [interview("报酬另算")],
          [
            file("payroll", "计入招聘所列的 8,000 元"),
            file("payroll", "完成当月两次周六布撤展后发放"),
          ],
        ],
        explanation:
          "当时说的另算是指工资表会单列一行。按目前的方案，津贴仍计入招聘报价，完成两次才发，也不按实际工时补差。",
        clarification: {
          reply:
            "我可以把现行口径写清楚。还是要完成两次轮值才能发津贴，加班的结算条件照原附件。",
          patches: [
            {
              source: "clause:hours",
              before: "项目工时记录由运营主管每月核对。",
              after:
                "完成当月两次周六布撤展后，按附件发放固定项目津贴。项目津贴不按实际工时补差。",
            },
          ],
        },
        patches: [
          {
            source: "clause:hours",
            before: "项目工时记录由运营主管每月核对。",
            alternative:
              "完成当月两次周六布撤展后，按附件发放固定项目津贴。项目津贴不按实际工时补差。",
            after: "加班按实际工时记录依法另行结算，并按规定安排适用的补休。",
          },
          {
            source: "clause:salary",
            before: "固定工资及项目津贴以《项目岗薪酬确认单》为准。",
            after:
              "固定工资见《项目岗薪酬确认单》，加班报酬按工作时间条款另行结算。",
          },
          {
            source: "file:payroll",
            before:
              "周末项目津贴为 1,200 元，完成当月两次周六布撤展后发放，计入招聘所列的 8,000 元。项目津贴不按实际工时补差。",
            after:
              "周六轮值的加班待遇按实际工时依法另行结算。原固定津贴及按次数发放的门槛取消。",
          },
        ],
      },
      coverage: {
        groups: [
          [line("social", "自实际用工起依法办理")],
          [file("coverage", "于转正后开始办理参保")],
        ],
        explanation:
          "这份确认单是按转正后开始参保做的，和正文写的起点对不上。我会让人事重新核对两份文字。",
        attachments: {
          coverage:
            "自实际用工起依法办理参保缴费。原现金替代及延后参保选项删除。",
        },
      },
    },
  },
  fangzhou: {
    interview:
      "周一直接进仓库。只要到了岗，出勤一天就结算一天。头一周可以看看自己适不适应。",
    routes: {
      salary: {
        calculation: ["settlement"],
        conditions: ["settlement", "handover"],
        writing: ["settlement"],
      },
      exit: {
        conditions: ["settlement"],
        scope: ["settlement", "handover"],
        writing: ["settlement"],
      },
      role: {
        responsibility: ["handover"],
        scope: ["handover"],
        writing: ["handover"],
      },
    },
    directory: ["settlement"],
    comparisons: {
      threshold: {
        groups: [
          [interview("出勤一天就结算一天")],
          [file("settlement", "不足七日离场的")],
        ],
        explanation:
          "仓库确实从第一天记录出勤。不过目前结算系统把前七天挂在留存条件下，离场不足七日就不会出工资单。",
        attachments: {
          settlement:
            "从实际提供劳动的第一日起按出勤生成工资结算单。离场交接和留存考核不影响工资。",
        },
      },
    },
  },
  chijian: {
    interview:
      "面试通过的是设计助理全职岗位。毕业证已经验过了，入职后按团队考勤，正常接客户的活。",
    routes: {
      identity: {
        conditions: ["graduation"],
        responsibility: ["assignment"],
        scope: ["graduation", "assignment"],
        writing: ["graduation"],
      },
      role: {
        conditions: ["assignment"],
        responsibility: ["assignment"],
        scope: ["assignment"],
        writing: ["assignment"],
      },
      salary: { calculation: ["assignment"], writing: ["graduation"] },
      social: { conditions: ["graduation"], scope: ["graduation"] },
    },
    directory: ["graduation"],
    comparisons: {
      employment: {
        groups: [
          [
            line("identity", "毕业实践人员身份"),
            line("social", "正式录用并签订劳动合同后"),
          ],
          [
            interview("全职岗位"),
            file("graduation", "全职长期就业"),
            file("graduation", "无学校参与或教学计划"),
          ],
          [
            file("assignment", "接受主管管理"),
            line("role", "按照部门考勤要求出勤"),
          ],
        ],
        explanation:
          "实践是我们现在的登记名称。你说的也对，入职后是团队考勤，做的是客户交付，和学校教学实习的安排不同。",
        attachments: {
          graduation:
            "毕业证已核验，按全职就业登记。正式劳动合同自实际用工起执行。",
        },
      },
    },
  },
  yuchuan: {
    interview:
      "是与川数字直接招你，我们这边负责岗位和日常管理。工资与社保的经办安排以书面合同为准。",
    routes: {
      party: {
        conditions: ["entities"],
        responsibility: ["entities", "manager"],
        scope: ["entities"],
        writing: ["entities"],
      },
      management: {
        responsibility: ["manager", "entities"],
        scope: ["manager"],
        writing: ["entities"],
      },
      salary: { calculation: ["entities"], responsibility: ["entities"] },
      social: { responsibility: ["entities"], writing: ["entities"] },
    },
    directory: ["entities"],
    comparisons: {
      employer: {
        groups: [
          [
            line("party", "甲方为与川商务咨询"),
            file("entities", "与川商务咨询签署合同"),
          ],
          [
            interview("与川数字直接招你"),
            file("manager", "由与川数字招聘、考勤和考核"),
          ],
          [file("entities", "各业务单位自行协调")],
        ],
        explanation:
          "日常确实由数字公司管。单看集团代发工资说明不了责任归谁，你指出的是这份安排只写了内部协调，没有写清欠薪和参保责任。",
        attachments: {
          entities:
            "与川数字有限公司为合同甲方，安排岗位并承担工资、社会保险及日常用工管理责任。",
        },
      },
    },
  },
  jingyuan: {
    interview:
      "运营助理只整理对外发布的信息，权限在入职前给你确认。保密范围按岗位实际接触的资料确定。",
    routes: {
      role: {
        responsibility: ["access"],
        scope: ["access"],
        writing: ["access"],
      },
      confidential: {
        conditions: ["restriction"],
        scope: ["restriction", "access"],
        writing: ["restriction"],
        responsibility: ["access"],
      },
    },
    directory: ["restriction"],
    comparisons: {
      competition: {
        groups: [
          [file("restriction", "不得在任何互联网或软件企业任职")],
          [
            file("access", "无源代码"),
            file("access", "本岗位仅访问公开发布"),
            interview("只整理对外发布的信息"),
          ],
        ],
        explanation:
          "保密附件是统一模板。你这个岗位的确只开放公开资料，这个全行业限制没有针对你的权限做过调整。",
        attachments: {
          restriction:
            "本岗位依法承担实际接触的保密信息保护义务。原离职竞业限制及十万元违约金删除。",
        },
      },
    },
  },
  yuanxu: {
    interview:
      "固定税前月薪 7,600 元。周六轮值最多每月一次，加班另行结算。附件里的实发金额是测算值。",
    routes: {
      salary: {
        calculation: ["payroll"],
        conditions: ["payroll"],
        writing: ["payroll"],
      },
      hours: {
        calculation: ["payroll", "roster"],
        conditions: ["roster"],
        responsibility: ["roster"],
        scope: ["roster"],
        writing: ["roster"],
      },
      social: {
        conditions: ["coverage"],
        scope: ["coverage"],
        writing: ["coverage"],
      },
    },
    directory: ["payroll", "roster", "coverage"],
    comparisons: {},
    compatible: {
      groups: [
        [
          interview("固定税前月薪 7,600 元"),
          line("salary", "固定税前工资均为 7,600 元"),
          file("payroll", "固定税前工资 7,600 元"),
        ],
        [file("payroll", "预计实发 6,850 元")],
      ],
      reply:
        "合同的 7,600 元是税前固定工资，测算单的 6,850 元是估扣个人应缴项目后的预计到账。税前工资仍按合同，实际到账以工资单为准。",
    },
  },
};
