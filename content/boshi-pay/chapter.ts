import type { Chapter } from "../../src/model.js";

export const boshi: Chapter = {
  "id": "boshi-pay",
  "revision": 3,
  "title": "泊石展务",
  "subtitle": "01 / 八千怎么拆",
  "setting": "展务执行助理 · 毕业后的第一份邀约",
  "contact": {
    "name": "林悦",
    "role": "招聘 HR",
    "mark": "林"
  },
  "initialFiles": [
    "contract",
    "interview"
  ],
  "contract": "contract",
  "start": "opening",
  "source": {
    "title": "原型资料：劳动人事争议典型案例（第二批），案例 4",
    "url": "https://www.court.gov.cn/zixun/xiangqing/319151.html"
  },
  "documents": {
    "contract": {
      "name": "劳动合同",
      "detail": "泊石展务 · 展务执行助理",
      "sections": [
        {
          "id": "term",
          "label": "01 · 合同期限",
          "lines": [
            {
              "id": "term",
              "text": "本合同期限一年，其中试用期两个月。合同变更由双方协商，并以书面形式确认。"
            }
          ]
        },
        {
          "id": "role",
          "label": "02 · 岗位与地点",
          "lines": [
            {
              "id": "role",
              "text": "乙方担任展务执行助理，工作地点为本市展务中心。"
            },
            {
              "id": "duty",
              "text": "工作包括现场签到、物料交接及布撤展协助。"
            }
          ]
        },
        {
          "id": "hours",
          "label": "03 · 工作时间",
          "lines": [
            {
              "id": "hours",
              "text": "实行标准工时。布撤展轮值由项目组安排，以当期排班为准。"
            },
            {
              "id": "record",
              "text": "项目工时记录由运营主管每月核对。"
            }
          ]
        },
        {
          "id": "salary",
          "label": "04 · 劳动报酬",
          "lines": [
            {
              "id": "quote",
              "text": "税前月度薪酬标准为 8,000 元。"
            },
            {
              "id": "basis",
              "text": "固定工资及项目津贴以《项目岗薪酬确认单》为准。"
            },
            {
              "id": "payday",
              "text": "上月工资于每月 10 日发放。"
            }
          ]
        },
        {
          "id": "insurance",
          "label": "05 · 社会保险",
          "lines": [
            {
              "id": "insurance",
              "text": "甲方自实际用工起依法办理社会保险参保缴费，个人应缴部分由甲方代扣代缴。"
            }
          ]
        },
        {
          "id": "copy",
          "label": "06 · 文本与附件",
          "lines": [
            {
              "id": "copy",
              "text": "双方签署后各执一份。合同所列附件须在签署前提供，并与正文一并确认。"
            }
          ]
        }
      ]
    },
    "interview": {
      "name": "面试后聊天",
      "detail": "林悦 · 面试当天",
      "sections": [
        {
          "label": "薪资确认 · 16:42",
          "lines": [
            {
              "id": "fixed",
              "text": "对，周一到周五正常出勤，税前固定 8,000 元。"
            },
            {
              "id": "extra",
              "text": "周六有布撤展的话，按实际出勤另外算，不从那八千里出。"
            },
            {
              "id": "joining",
              "text": "报到先去二号馆，我让运营带你进场。"
            }
          ]
        }
      ]
    },
    "payroll": {
      "name": "项目岗薪酬确认单",
      "detail": "薪酬组 · 展务执行助理",
      "sections": [
        {
          "label": "01 · 固定工资",
          "lines": [
            {
              "id": "fixed",
              "text": "正常工时固定工资为 6,800 元。"
            }
          ]
        },
        {
          "label": "02 · 周末项目结算",
          "lines": [
            {
              "id": "extra",
              "text": "周末项目津贴为 1,200 元，完成当月两次周六布撤展后发放，计入招聘所列的 8,000 元。"
            },
            {
              "id": "difference",
              "text": "项目津贴不按实际工时补差。"
            }
          ]
        },
        {
          "label": "03 · 发放日期",
          "lines": [
            {
              "id": "payday",
              "text": "上月工资于每月 10 日发放。"
            }
          ]
        }
      ]
    },
    "roster": {
      "name": "下月项目拟排班",
      "detail": "运营组 · 未含临时调整",
      "sections": [
        {
          "label": "项目组排班备注",
          "lines": [
            {
              "id": "saturday",
              "text": "下月第一及第三个周六布撤展，展务执行助理须到场。"
            },
            {
              "id": "swap",
              "text": "本轮未安排补休，遇场馆改期以新排班为准。"
            }
          ]
        }
      ]
    }
  },
  "amendments": {
    "fixed": {
      "title": "固定工资写入正文",
      "edited": "我的固定工资谈到了税前 7,400 元，两份文件写的都是这个数。",
      "open": "正常出勤我能拿到的固定工资还是 6,800 元。面试时说的固定八千没有写进去。",
      "lesson": "我得比的是面试和确认单上的两个固定工资。正文里的「月度薪酬标准」看着也是八千，但它没说八千全是固定的。",
      "edits": [
        {
          "document": "contract",
          "line": "quote",
          "text": "标准工时税前固定工资为 7,400 元。"
        },
        {
          "document": "payroll",
          "line": "fixed",
          "text": "正常工时固定工资为 7,400 元。"
        },
        {
          "document": "payroll",
          "line": "extra",
          "unlessAmended": "weekend",
          "text": "周末项目津贴为 1,200 元，须完成当月两次周六布撤展方可领取，不足两次不发。"
        }
      ]
    },
    "weekend": {
      "title": "周六按实际工时另结",
      "edited": "我周六做了多少工时，就按记录另结。运营还可能排我两个周六。",
      "open": "只去一个周六，我就拿不到这笔津贴。原确认单上也没写按实际工时补差。",
      "lesson": "林悦说去一场算一场，确认单却写要去满两次。我得引用发钱的条件；拟排班只能告诉我哪天要到场。",
      "edits": [
        {
          "document": "contract",
          "line": "record",
          "text": "周六布撤展的实际工时由运营主管记录并按月核对，超出正常工时的报酬按该记录另行结算。"
        },
        {
          "document": "contract",
          "line": "quote",
          "unlessAmended": "fixed",
          "text": "标准工时税前固定工资按《项目岗薪酬确认单》的固定工资项执行。"
        },
        {
          "document": "contract",
          "line": "basis",
          "text": "周六布撤展超出正常工时的报酬按实际记录另行结算，不计入固定工资，不设最低轮值次数。"
        },
        {
          "document": "payroll",
          "line": "extra",
          "text": "原固定周末项目津贴及两次轮值门槛取消。周六超出正常工时的报酬按实际记录另行结算。"
        },
        {
          "document": "payroll",
          "line": "difference",
          "text": "运营主管按月确认周六实际工时，薪酬组在工资单上单列结算。"
        }
      ]
    },
    "timeRecords": {
      "title": "本人可核对周六工时",
      "edited": "每月结算前我能收到自己的周六工时明细，漏记可以找运营主管核对。",
      "open": "周六工时由运营主管记录。合同里还没有约定结算前给我核对明细。",
      "lesson": "按工时结算以后，我还得能核对用来算钱的那份记录。",
      "edits": [
        {
          "document": "contract",
          "line": "record",
          "text": "周六布撤展的实际工时由运营主管记录并按月核对。结算前须向乙方提供本人明细，乙方可要求核对漏记或错记。超出正常工时的报酬按核对后的记录另行结算。"
        },
        {
          "document": "payroll",
          "line": "difference",
          "text": "运营主管在月度结算前向乙方提供周六实际工时明细并核对异议，薪酬组按核对后的记录在工资单上单列结算。"
        }
      ]
    }
  },
  "topics": {
    "term": {
      "label": "01 · 合同期限",
      "start": "ask_term"
    },
    "role": {
      "label": "02 · 岗位与地点",
      "start": "ask_role"
    },
    "hours": {
      "label": "03 · 工作时间",
      "start": "ask_hours",
      "amendments": [
        "weekend",
        "timeRecords"
      ],
      "followUps": [
        {
          "after": "timeRecords",
          "start": "ask_hours_1"
        },
        {
          "after": "weekend",
          "start": "ask_hours_2"
        }
      ]
    },
    "salary": {
      "label": "04 · 劳动报酬",
      "start": "ask_salary",
      "amendments": [
        "fixed"
      ],
      "followUps": [
        {
          "after": "fixed",
          "start": "ask_salary_1"
        }
      ]
    },
    "insurance": {
      "label": "05 · 社会保险",
      "start": "ask_insurance"
    },
    "copy": {
      "label": "06 · 文本与附件",
      "start": "ask_copy"
    }
  },
  "clauseTopics": {
    "term": "term",
    "role": "role",
    "hours": "hours",
    "salary": "salary",
    "insurance": "insurance",
    "copy": "copy"
  },
  "endings": {
    "sign": {
      "title": "已签署当前版本",
      "detail": "我签的是现在这版。最后谈下来的条件，我再记一遍。"
    },
    "leave": {
      "title": "未签署合同",
      "detail": "我没签。最后桌上是这份条件，我记下来，下次看合同还能用上。"
    }
  },
  "proofs": {
    "fixedWindow": {
      "steps": [
        "fixedWindow_step_1",
        "fixedWindow_step_2"
      ],
      "accepts": [
        {
          "lines": [
            "payroll.fixed",
            "interview.fixed"
          ],
          "go": "fixedWindow_right_1"
        }
      ],
      "mistakes": [
        {
          "lines": [
            "contract.quote",
            "payroll.fixed"
          ],
          "unlessAmended": "weekend",
          "go": "fixedWindow_mistake_1"
        }
      ],
      "wrong": "fixedWindow_wrong",
      "back": [
        {
          "ifFile": "payroll",
          "go": "payroll"
        },
        {
          "go": "salary"
        }
      ],
      "defer": {
        "text": "先沉默",
        "go": "fixedWindow_defer"
      }
    },
    "weekendWindow": {
      "anchor": "reply",
      "steps": [
        "weekendWindow_step_1"
      ],
      "accepts": [
        {
          "lines": [
            "payroll.extra"
          ],
          "go": "weekendWindow_right_1"
        }
      ],
      "mistakes": [
        {
          "lines": [
            "roster.saturday"
          ],
          "go": "weekendWindow_mistake_1"
        },
        {
          "lines": [
            "interview.extra"
          ],
          "go": "weekendWindow_mistake_2"
        }
      ],
      "wrong": "weekendWindow_wrong",
      "back": [
        {
          "go": "weekend"
        }
      ],
      "defer": {
        "text": "先换个话题",
        "go": "weekendWindow_defer"
      }
    }
  },
  "deadlocks": {
    "fixedBlocked": [
      {
        "ifFile": "payroll",
        "go": "payroll"
      },
      {
        "go": "salary"
      }
    ],
    "weekendBlocked": [
      {
        "go": "weekend"
      }
    ]
  }
};
