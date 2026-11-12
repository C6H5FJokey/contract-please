// Edit the lines here. IDs link dialogue, document quotations and written amendments.
const salaryBack = [{ ifFile: "payroll", go: "payroll" }, { go: "salary" }];
const weekendBack = [{ go: "weekend" }];
const weekendRebuttal = ["你刚说去一场就算一场。可确认单写的是做满两次才发。要是第二场临时取消，我第一场明明去了，按这行也拿不到钱。能把按实际出勤另结写进去吗？"];

export const boshi = {
  id: "boshi-pay",
  revision: 2,
  title: "泊石展务",
  subtitle: "01 / 八千怎么拆",
  setting: "展务执行助理 · 毕业后的第一份邀约",
  contact: { name: "林悦", role: "招聘 HR", mark: "林" },
  initialFiles: ["contract", "interview"],
  contract: "contract",
  start: "opening",
  review: {
    node: "desk",
    pause: "这条先谈到这儿，我再看一下合同。",
    topics: {
      term: { start: "term", player: "我想先确认一下这一年的期限和试用期是怎么算的。" },
      role: { start: "role", player: "岗位和地点这条，我想先确认平时在哪儿上班、现场要做什么。" },
      hours: {
        start: "weekend",
        player: "工作时间这条我想问一下。正文说标准工时，后面又写布撤展轮值，这个实际怎么排？",
        amendments: ["weekend", "timeRecords"],
        followUps: [
          { after: "timeRecords", start: "recordsConfirmed", player: "工作时间这条我再确认一下。月末工时发给我后，有漏记找谁？" },
          { after: "weekend", start: "reviewHours", player: "工作时间这条我想再确认一下。现在按实际工时结，我自己能看到主管记的工时吗？" },
        ],
      },
      salary: {
        start: "salary",
        player: "劳动报酬这条，我想把合同上的八千问清楚再签。",
        amendments: ["fixed"],
        followUps: [
          { after: "fixed", start: "reviewSalary", player: "我再确认一下改过的报酬。固定七千四，试用期也按这个数吗？" },
        ],
      },
      insurance: { start: "insurance", player: "我想确认下参保的起点。试用期也从入职开始办吗？" },
      copy: { start: "copies", player: "最后这条说正文和附件一起签。我签之前能看到哪些文件？" },
    },
  },
  source: {
    title: "原型资料：劳动人事争议典型案例（第二批），案例 4",
    url: "https://www.court.gov.cn/zixun/xiangqing/319151.html",
  },
  documents: {
    contract: {
      name: "劳动合同",
      detail: "泊石展务 · 展务执行助理",
      sections: [
        { id: "term", label: "01 · 合同期限", lines: [
          { id: "term", text: "本合同期限一年，其中试用期两个月。合同变更由双方协商，并以书面形式确认。" },
        ] },
        { id: "role", label: "02 · 岗位与地点", lines: [
          { id: "role", text: "乙方担任展务执行助理，工作地点为本市展务中心。" },
          { id: "duty", text: "工作包括现场签到、物料交接及布撤展协助。" },
        ] },
        { id: "hours", label: "03 · 工作时间", lines: [
          { id: "hours", text: "实行标准工时。布撤展轮值由项目组安排，以当期排班为准。" },
          { id: "record", text: "项目工时记录由运营主管每月核对。" },
        ] },
        { id: "salary", label: "04 · 劳动报酬", lines: [
          { id: "quote", text: "税前月度薪酬标准为 8,000 元。" },
          { id: "basis", text: "固定工资及项目津贴以《项目岗薪酬确认单》为准。" },
          { id: "payday", text: "上月工资于每月 10 日发放。" },
        ] },
        { id: "insurance", label: "05 · 社会保险", lines: [
          { id: "insurance", text: "甲方自实际用工起依法办理社会保险参保缴费，个人应缴部分由甲方代扣代缴。" },
        ] },
        { id: "copy", label: "06 · 文本与附件", lines: [
          { id: "copy", text: "双方签署后各执一份。合同所列附件须在签署前提供，并与正文一并确认。" },
        ] },
      ],
    },
    interview: {
      name: "面试后聊天",
      detail: "林悦 · 面试当天",
      sections: [
        { label: "薪资确认 · 16:42", lines: [
          { id: "fixed", text: "对，周一到周五正常出勤，税前固定 8,000 元。" },
          { id: "extra", text: "周六有布撤展的话，按实际出勤另外算，不从那八千里出。" },
          { id: "joining", text: "报到先去二号馆，我让运营带你进场。" },
        ] },
      ],
    },
    payroll: {
      name: "项目岗薪酬确认单",
      detail: "薪酬组 · 展务执行助理",
      sections: [
        { label: "01 · 固定工资", lines: [
          { id: "fixed", text: "正常工时固定工资为 6,800 元。" },
        ] },
        { label: "02 · 周末项目结算", lines: [
          { id: "extra", text: "周末项目津贴为 1,200 元，完成当月两次周六布撤展后发放，计入招聘所列的 8,000 元。" },
          { id: "difference", text: "项目津贴不按实际工时补差。" },
        ] },
        { label: "03 · 发放日期", lines: [
          { id: "payday", text: "上月工资于每月 10 日发放。" },
        ] },
      ],
    },
    roster: {
      name: "下月项目拟排班",
      detail: "运营组 · 未含临时调整",
      sections: [
        { label: "项目组排班备注", lines: [
          { id: "saturday", text: "下月第一及第三个周六布撤展，展务执行助理须到场。" },
          { id: "swap", text: "本轮未安排补休，遇场馆改期以新排班为准。" },
        ] },
      ],
    },
  },
  amendments: {
    fixed: {
      title: "固定工资写入正文",
      edited: "我的固定工资谈到了税前 7,400 元，两份文件写的都是这个数。",
      open: "正常出勤我能拿到的固定工资还是 6,800 元。面试时说的固定八千没有写进去。",
      lesson: "我得比的是面试和确认单上的两个固定工资。正文里的「月度薪酬标准」看着也是八千，但它没说八千全是固定的。",
      edits: [
        { document: "contract", line: "quote", text: "标准工时税前固定工资为 7,400 元。" },
        { document: "payroll", line: "fixed", text: "正常工时固定工资为 7,400 元。" },
        { document: "payroll", line: "extra", unlessAmended: "weekend",
          text: "周末项目津贴为 1,200 元，须完成当月两次周六布撤展方可领取，不足两次不发。" },
      ],
    },
    weekend: {
      title: "周六按实际工时另结",
      edited: "我周六做了多少工时，就按记录另结。运营还可能排我两个周六。",
      open: "只去一个周六，我就拿不到这笔津贴。原确认单上也没写按实际工时补差。",
      lesson: "林悦说去一场算一场，确认单却写要去满两次。我得引用发钱的条件；拟排班只能告诉我哪天要到场。",
      edits: [
        { document: "contract", line: "record",
          text: "周六布撤展的实际工时由运营主管记录并按月核对，超出正常工时的报酬按该记录另行结算。" },
        { document: "contract", line: "quote", unlessAmended: "fixed",
          text: "标准工时税前固定工资按《项目岗薪酬确认单》的固定工资项执行。" },
        { document: "contract", line: "basis",
          text: "周六布撤展超出正常工时的报酬按实际记录另行结算，不计入固定工资，不设最低轮值次数。" },
        { document: "payroll", line: "extra",
          text: "原固定周末项目津贴及两次轮值门槛取消。周六超出正常工时的报酬按实际记录另行结算。" },
        { document: "payroll", line: "difference", text: "运营主管按月确认周六实际工时，薪酬组在工资单上单列结算。" },
      ],
    },
    timeRecords: {
      title: "本人可核对周六工时",
      edited: "每月结算前我能收到自己的周六工时明细，漏记可以找运营主管核对。",
      open: "周六工时由运营主管记录。合同里还没有约定结算前给我核对明细。",
      lesson: "按工时结算以后，我还得能核对用来算钱的那份记录。",
      edits: [
        { document: "contract", line: "record",
          text: "周六布撤展的实际工时由运营主管记录并按月核对。结算前须向乙方提供本人明细，乙方可要求核对漏记或错记。超出正常工时的报酬按核对后的记录另行结算。" },
        { document: "payroll", line: "difference",
          text: "运营主管在月度结算前向乙方提供周六实际工时明细并核对异议，薪酬组按核对后的记录在工资单上单列结算。" },
      ],
    },
  },
  stale: "你引的是上一版已经换掉的那句话。我得按现在发你的这份核。我们回到刚才那一项。",
  refusal: {
    say: [
      "我知道你还没放心。不过这轮聊下来，我们好像很难在这份合同上达成一致。",
      "我先把签署流程停一下，也不耽误你看别的机会了。",
    ],
    thought: "她已经要停签了。我还能试着把话说回刚才那一条，或者就到这儿。",
    resume: "先别关。我只想把刚才那条说清楚，能再谈一次吗？",
    return: ["行。我们就说刚才那一条。发过的文件还在，你照最新那份看。"],
    leave: "好，我这边就不往下签了。谢谢。",
  },
  endings: {
    sign: { player: "我这边就按当前版本签了。", say: ["收到。正文和确认单是一起走的，签完记得把两份都存一下。"], files: ["payroll"], title: "已签署当前版本", detail: "我签的是现在这版。最后谈下来的条件，我再记一遍。" },
    leave: { player: "这份合同我先不签了，辛苦你。", say: ["明白。我跟运营说一声，这边先把流程关掉。"], title: "未签署合同", detail: "我没签。最后桌上是这份条件，我记下来，下次看合同还能用上。" },
  },
  nodes: {
    opening: {
      say: ["合同发你了，运营那边想下月就有人进场。你先看，哪条要确认就跟我说。"],
      thought: "我先把合同翻一遍。有哪条没看明白，我就从那一条问起。",
      go: "desk",
    },
    term: {
      say: ["从报到那天算一年。前两个月是试用期，已经算在这一年里了，转正不会重新起算。"],
      choices: [
        { id: "dates", text: "签之前能把起止日期填好给我看一下吗？", go: "termDates" },
        { id: "done", text: "明白，试用期包含在一年里。我接着看。", go: "desk" },
      ],
    },
    termDates: {
      say: ["可以，等我们定下报到日，我把起止日期填进签署版。你拿到的时候再核一下。"],
      go: "desk",
    },
    role: {
      say: ["平时去市展务中心的二号馆报到。进场以后主要跟签到、对物料，布展和撤展的时候跟着现场负责人走。"],
      choices: [
        { id: "locations", text: "项目换了就要去别的城市吗？", go: "roleLocations" },
        { id: "done", text: "好，地点和日常工作我都记下了。", go: "desk" },
      ],
    },
    roleLocations: {
      say: ["这次招的是展务中心这个岗位。现在没有外地安排。以后真要长期调地点，我们会另外跟你谈。"],
      go: "desk",
    },
    insurance: {
      say: ["对，试用期也按实际到岗日期登记。入职当天把参保资料给我，我转给人事办。"],
      choices: [
        { id: "records", text: "个人扣的那部分，我能在哪里核对？", go: "insuranceRecords" },
        { id: "done", text: "了解，参保起点按入职日。那我先继续看合同。", go: "desk" },
      ],
    },
    insuranceRecords: {
      say: ["个人扣的部分在工资条上单独列。你查到的参保记录要是跟报到日期对不上，直接发我，我让人事核。"],
      go: "desk",
    },
    copies: {
      say: ["这份正文和薪酬确认单一起签。运营发的排班会变，不跟签署包绑在一起。签完两份你都能下载。"],
      choices: [
        { id: "files", text: "那先把确认单也发我吧。我想签前把两份一起看。", go: "copyPayroll" },
        { id: "done", text: "好，签完我会把两份一起存下来。", go: "desk" },
      ],
    },
    copyPayroll: {
      say: ["可以，薪酬组给我的就是这份。你先跟正文一起看。"],
      revisit: ["确认单已经发在上面了。有改稿的话，以最后发的那版为准。"],
      files: ["payroll"],
      go: "desk",
    },
    salary: {
      say: ["八千是运营批的岗位报价，发薪日期也在正文上。你是想确认哪一部分？"],
      choices: [
        { id: "lines", text: "工资条上，固定工资那一栏会填多少？我想核一下明细。", go: "payroll" },
        { id: "confirm", text: "面试那天说的是正常出勤固定八千。今天发来的也是这个意思？", go: "fixedWindow" },
        { id: "noShift", text: "如果项目改期，一个周六都没排到我，到账会少吗？", go: "conditional" },
      ],
    },
    conditional: {
      say: ["那要看当月排班。我没法拿一个还没排出来的月给你算工资。", "但项目排得挺满的，来了你就知道，周六一般都有活儿。"],
      choices: [
        { id: "lines", text: "先不算哪一月。零次周六也照发的那一项，单子上是多少？", go: "payroll" },
        { id: "confirm", text: "排班可以变，面试答应的固定部分总不会跟着变吧？", go: "fixedWindow" },
        { id: "roster", text: "下个月先给我看一下。我得知道周六轮值是怎么算进来的。", go: "earlyRoster" },
      ],
    },
    earlyRoster: {
      say: ["运营的拟排班我能发。先别按具体日期订票，场馆那边还可能动。"],
      files: ["roster"],
      choices: [
        { id: "lines", text: "看到了。现在能把工资拆分发我吗？我想把排班和固定工资分开看。", go: "payroll" },
        { id: "confirm", text: "这两场先按要到场算。固定八千跟这两场无关，对吧？", go: "fixedWindow" },
        { id: "later", text: "排班我先记下来。我再回合同看看还有什么要问的。", go: "desk" },
      ],
    },
    payroll: {
      say: ["工资条要入职以后才有。跟合同一起走的是这个单子，薪酬组按它录数。你先看。"],
      revisit: ["工资明细就在刚才发的确认单上。你要核的是哪一项？"],
      files: ["payroll"],
      choices: [
        { id: "confirm", text: "面试微信里你特意说了『固定』。跟这张单上的固定项是一回事吗？", go: "fixedWindow" },
        { id: "insist", text: "这个写法我签不了。你先把固定八千填上，其他再谈。", go: "fixedHard" },
        { id: "later", text: "固定的先放一下，我回去核对一下手头的文本。", go: "desk" },
      ],
    },
    fixedHard: {
      say: ["表是薪酬组批的，我不能自己把数填上去。你让我拿什么去找他们重批？"],
      choices: [
        { id: "confirm", text: "就拿面试谈的口径。你当时说的固定工资，是不是确认单上这一栏？", go: "fixedWindow" },
        { id: "insist", text: "那你现在就答应八千。给不了，这合同没什么好谈的。", go: "fixedBlocked" },
        { id: "later", text: "我先把面试记录再看一下，这个数暂时不谈。", go: "desk" },
      ],
    },
    fixedBlocked: {
      say: ["那这个数我给不了。你要是愿意谈具体哪一条，我们还可以聊。"],
      deadlock: salaryBack,
    },
    fixedWindow: {
      say: ["我面试报的就是审批过的那个数。你说的『固定』和确认单上的固定工资是一个口径，这里没改过。"],
      proof: {
        steps: [
          "她说固定工资没改过。我先找找，现在发来的材料是怎么写这笔工资的？",
          "那面试时她给我的是哪个数？我得找出说的也是正常出勤的那一句。",
        ],
        accepts: [{
          lines: ["payroll.fixed", "interview.fixed"],
          say: ["我把两句放在一起了。面试微信上你说周一到周五正常出勤，固定八千；这张确认单写同样是正常工时，固定只有六千八。差的一千二不是换个叫法就能补上的。能按固定工资这一项重新确认吗？"],
        }],
        mistakes: [
          { lines: ["contract.quote", "payroll.fixed"], unlessAmended: "weekend",
            say: ["正文写的是月度薪酬标准，没写八千全是固定的。你这两句一个是总数，一个是明细。我刚才说的是面试报的固定项。"] },
        ],
        wrong: ["这几句我看了。得是同一个岗位、同样出勤下的固定工资，才能直接比这两个数。我们先回到固定项上。"],
        back: salaryBack,
        defer: {
          text: "先沉默",
          thought: "我先把这句话记下来。原文还没找齐，现在争也说不清。",
          say: ["没事，你再看看。固定工资这块你想确认哪一项？"],
        },
        success: "fixedOffer",
      },
    },
    fixedOffer: {
      say: [
        "……看到了。那天『固定』是我打的，我不能说你听错了。",
        "我拿这条记录去争了一下。现在能给到税前固定七千四，能写进正文。八千固定我确实拿不到。",
      ],
      choices: [
        { id: "accept", text: "七千四可以。正文和薪酬确认单的固定项一起改，别留两个数。", go: "fixedApply" },
        { id: "counter", text: "还有没有可能按面试的八千报一次？就按固定这一项报。", go: "fixedFinal" },
        { id: "later", text: "七千四我先不答应，让我再看看手头的版本。", go: "desk" },
      ],
    },
    fixedFinal: {
      say: ["我刚问过。七千四是运营同意加过一次的数，我现在可以把它写下来。八千我手里没有这个批复。"],
      choices: [
        { id: "accept", text: "那就把七千四写进正文，确认单也改成一样的。", go: "fixedApply" },
        { id: "insist", text: "非八千不谈。没有这个数，别再发别的条件。", go: "fixedBlocked" },
        { id: "later", text: "先别改。我想先把别的条款核一遍。", go: "desk" },
      ],
    },
    fixedApply: {
      say: ["两份都改了。固定是七千四，你核对一下这一栏。"],
      amend: "fixed",
      thought: "七千四现在写进两份文件了。我得按这版核对。",
      go: "desk",
    },
    reviewSalary: {
      say: ["对，试用期也是七千四。确认单只有一个固定工资项，我们没有另外给你套试用期的数。"],
      go: "desk",
    },
    weekend: {
      say: ["周六那块跟着展期走。新人一般一个月两场，运营会把人排进去。"],
      choices: [
        { id: "roster", text: "能看一下拟排班吗？我想知道哪两天、是不是必须到场。", go: "roster" },
        { id: "one", text: "假设场馆改期，我只去了一次。那一次的工时是单独结的吧？", go: "weekendWindow" },
        { id: "lines", text: "排几次先不急。薪酬组拿哪份文件算周六的钱？", go: "weekendPay" },
      ],
    },
    roster: {
      say: ["我把运营发的排班给你。这两个周六我们都缺人，排到就得去。日期有变他们会再通知。"],
      revisit: ["就是刚才那份拟排班。两个周六人手都紧，具体日期还有可能动。"],
      files: ["roster"],
      choices: [
        { id: "one", text: "排班上写了可能改期。第二场取消的话，第一场的报酬还照结吗？", go: "weekendWindow" },
        { id: "lines", text: "我知道要去现场了。负责算钱的人按什么文件结？", go: "weekendPay" },
        { id: "cancel", text: "周六的轮值能取消吗？这两天对我来说也是时间。", go: "weekendHard" },
      ],
    },
    weekendPay: {
      say: ["用的是确认单。排班临时变很正常，这份单子是统一给薪酬组的。"],
      revisit: ["薪酬组按已经发你的确认单走。你说的是哪种排班？"],
      files: ["payroll"],
      choices: [
        { id: "one", text: "如果第二场没排到我，第一场还是按出勤单独结？", go: "weekendWindow" },
        { id: "roster", text: "先看看排班。我得知道这个『两次』是不是我自己能决定。", go: "roster" },
        { id: "later", text: "我先把面试时说的结法找出来。", go: "desk" },
      ],
    },
    weekendHard: {
      say: ["这两个周六的场地都订了，我手上也没别的人。改轮值我做不了主，结算你可以跟我谈。"],
      choices: [
        { id: "one", text: "那先不动排班。只去一次时，那一次会单独结吗？", go: "weekendWindow" },
        { id: "insist", text: "不取消轮值就不谈。你现在给我一句周六不用去。", go: "weekendBlocked" },
        { id: "lines", text: "那先把给薪酬组的结算单发我，我回头再看排班。", go: "weekendPay" },
      ],
    },
    weekendBlocked: {
      say: ["我不能代运营答应。这条如果没别的谈法，就先放一下吧。"],
      deadlock: weekendBack,
    },
    weekendWindow: {
      say: ["按实际出勤结，去一场就算一场。确认单写两场是按常规排班来的，和我面试跟你说的另算是一回事。"],
      proof: {
        anchor: "reply",
        steps: ["只去一次也会单独结？我手里的文件真是这么写的吗？"],
        accepts: [{ lines: ["payroll.extra"], say: weekendRebuttal }],
        mistakes: [
          { lines: ["roster.saturday"],
            say: ["这是运营的排班，只写了你哪天要到。你问的是只去一场怎么算，得看薪酬组拿什么发钱。"] },
          { lines: ["interview.extra"],
            say: ["对，面试时我也是这么说的。你圈的这句和我现在说的一样啊。"] },
        ],
        wrong: ["我说的是只去一场还发不发。这句没写只去一场就没有钱。要不先回去看看单子？"],
        back: weekendBack,
        defer: {
          text: "先换个话题",
          thought: "先不跟她争这一句。我得看看薪酬组手里的那份写了什么。",
          player: "好，我先看看排班和结算单，再回你。",
          say: ["可以。你要看哪份，跟我说。"],
        },
        success: "weekendOffer",
      },
    },
    weekendOffer: {
      say: [
        "是，这行写的是两次才发。只去一场，薪酬组照这张单就不会发这笔钱。",
        "这样，我去掉两次的门槛，超出正常工时的周六报酬按现场记录另结。排班还得跟运营走，这个我不能帮你免掉。",
      ],
      choices: [
        { id: "accept", text: "可以。正文和确认单都写按实际工时另结，别再写必须做满两次。", go: "weekendApply" },
        { id: "check", text: "谁记实际工时？我不想到了发工资才知道那天没记上。", go: "weekendRecord" },
        { id: "later", text: "这个改法我先记着。我再对一下现在的文本。", go: "desk" },
      ],
    },
    weekendRecord: {
      say: ["现场交接是运营主管签字，月底他会核工时，再给薪酬。我让他们把这笔在工资单上单列，写进确认单。"],
      choices: [
        { id: "accept", text: "好，按记录另结和工资单单列都写进去，我核对改稿。", go: "weekendApply" },
        { id: "later", text: "我先回头看看其他条款，这个改法暂时不确认。", go: "desk" },
      ],
    },
    weekendApply: {
      say: ["更新好了。两次才发那行已经拿掉，记多少工时就按多少单独结。"],
      amend: "weekend",
      thought: "现在只去一场也有结算依据了。我把改过的那行再看一眼。",
      go: "desk",
    },
    reviewHours: {
      say: ["工资单上会单列金额。工时表是运营那边的，平时我们不单独发。"],
      choices: [
        { id: "request", text: "只看金额，我看不出来哪一场有没有记上。能不能结算前把我自己的工时明细发我核一下？", go: "recordsOffer" },
        { id: "later", text: "明白，这一条我先看到这儿。", go: "desk" },
      ],
    },
    recordsOffer: {
      say: ["整张工时表上有别人的信息，不能发。不过你自己的工时可以让运营单独发。发现漏记就找现场主管，他们核完再交薪酬。"],
      choices: [
        { id: "accept", text: "行，就把结算前发本人明细、漏记找运营核对这两点写进合同和确认单。", go: "recordsApply" },
        { id: "later", text: "好，我先把这个答复记下来。", go: "desk" },
      ],
    },
    recordsApply: {
      say: ["加上了。结算前运营会发你本人的明细，有漏记先找现场主管。两份文件都更新了。"],
      amend: "timeRecords",
      go: "desk",
    },
    recordsConfirmed: {
      say: ["找现场主管。你把哪一天、哪一场说清楚，他可以回去对现场记录，再交给薪酬组。"],
      go: "desk",
    },
    desk: {},
  },
};
