// Copyright (c) 2026 C6H5FJokey
// SPDX-License-Identifier: CC-BY-4.0

EXTERNAL has_file(id)
EXTERNAL has_clue(id)
EXTERNAL in_game()

-> opening

=== opening ===
合同发你了。运营那边催得紧，下个月就要人进场。你先看看，哪里不清楚直接问我。
居然真拿到 offer 了，先别高兴太早。工资、轮值，这些白纸黑字才作数，得看仔细。 # thought
-> desk

=== term ===
这一年从报到那天算。头两个月是试用，也算在这一年里，转正不会再从头算一遍。
+ [签之前能把起止日期填好给我看一下吗？ # choice:dates]
    -> termDates
+ [明白了，我接着看。 # choice:done]
    -> desk

=== termDates ===
可以，等我们定下报到日，我把起止日期填进签署版。你拿到的时候再核一下。
-> desk

=== role ===
平时到市展务中心二号馆。去了就是盯签到、对物料，布展撤展时听现场负责人安排。
+ [项目换了就要去别的城市吗？ # choice:locations]
    -> roleLocations
+ [好，我明白了。 # choice:done]
    -> desk

=== roleLocations ===
这次招的就是展务中心这边，目前没有外地安排。以后真要长期换地方，会另外跟你谈。
-> desk

=== insurance ===
对，试用期也从到岗那天开始办。入职当天把资料给我，我转给人事。
+ [个人扣的那部分，我能在哪里核对？ # choice:records]
    -> insuranceRecords
+ [了解，那我先继续看合同。 # choice:done]
    -> desk

=== insuranceRecords ===
你自己交多少，工资条会单列。参保时间跟报到日对不上，就直接发我，我让人事查。
-> desk

=== copies ===
正文和薪酬确认单要一起签。排班以后还会变，不放进签署包。签完这两份你都能下载。
+ [那先把确认单也发我吧。我想签前把两份一起看。 # choice:files]
    -> copyPayroll
+ [好，签完我会把两份一起存下来。 # choice:done]
    -> desk

=== copyPayroll ===
{has_file("payroll"):
确认单就在上面。后面要是改过，以最新那版为准。
- else:
可以，薪酬组给我的就是这份。你拿正文对着看。
# file:payroll
}
-> desk

=== salary ===
八千是运营批下来的报价，几号发也写在正文里。你具体想问哪一笔？
+ [工资条上，固定工资那一栏会填多少？我想核一下明细。 # choice:lines]
    -> payroll
+ [面试那天说的是正常出勤固定八千。今天发来的也是这个意思？ # choice:confirm]
    -> fixedWindow
+ [如果项目改期，一个周六都没排到我，到账会少吗？ # choice:noShift]
    -> conditional

=== conditional ===
那得看当月怎么排。班还没排出来，我也没法凭空给你算。
不过项目排得挺满，你来了就知道，周六一般都有活。
+ [先不算哪一月。零次周六也照发的那一项，单子上是多少？ # choice:lines]
    -> payroll
+ [排班可以变，面试答应的固定部分总不会跟着变吧？ # choice:confirm]
    -> fixedWindow
+ [下个月先给我看一下。我得知道周六轮值是怎么算进来的。 # choice:roster]
    -> earlyRoster

=== earlyRoster ===
运营的拟排班可以发你。先别照着日期安排别的事，场馆那边还可能改。
# file:roster
+ [看到了。现在能把工资拆分发我吗？我想把排班和固定工资分开看。 # choice:lines]
    -> payroll
+ [这两场先按要到场算。固定八千跟这两场无关，对吧？ # choice:confirm]
    -> fixedWindow
+ [排班我先记下来。我再回合同看看还有什么要问的。 # choice:later]
    -> desk

=== payroll ===
{has_file("payroll"):
明细就在刚才那张确认单上。你看哪一项不对？
- else:
工资条得入职以后才有。现在跟合同一起签的是这张单，薪酬组也照它录。你先看看。
# file:payroll
}
+ [面试微信里你特意说了『固定』。跟这张单上的固定项是一回事吗？ # choice:confirm]
    -> fixedWindow
+ [这个写法我签不了。你先把固定八千填上，其他再谈。 # choice:insist]
    -> fixedHard
+ [固定的先放一下，我回去核对一下手头的文本。 # choice:later]
    -> desk

=== fixedHard ===
表是薪酬组批的，我不能说改就改。你总得给我个理由，我好拿去重新申请。
+ [就拿面试谈好的来说。你当时说的固定工资，是不是确认单上这一栏？ # choice:confirm]
    -> fixedWindow
+ [那你现在就答应八千。给不了，这合同没什么好谈的。 # choice:insist]
    -> fixedBlocked
+ [我先把面试记录再看一下，这个数暂时不谈。 # choice:later]
    -> desk

=== fixedBlocked ===
那这个数我给不了。你要是愿意谈具体哪一条，我们还可以聊。
# deadlock:fixedBlocked
-> END

=== fixedWindow ===
我面试报的就是批下来的那个数。你说的「固定」，跟确认单上的固定工资是一个意思，这里没改过。
# proof:fixedWindow
-> END

=== fixedWindow_step_1 ===
她说固定工资一直没变。那就先看看确认单：固定那一栏到底写了多少？ # thought
-> END

=== fixedWindow_step_2 ===
再看面试微信。她当时亲口说的「固定八千」，得把那一句找出来。 # thought
-> END

=== fixedWindow_right_1 ===
你看这两句：面试微信里，你说周一到周五正常上班，固定八千；确认单上同样是正常工时，固定却只有六千八。少的一千二不是换个名字就能糊过去的。固定工资这项，麻烦重新确认。 # player
-> fixedOffer

=== fixedWindow_mistake_1 ===
正文那个八千是总包，我可没说八千全是固定工资。
一个是总数，一个是明细，确实比不到一块儿。我得把面试时的固定数和单上的固定项摆在一起。 # thought
-> END

=== fixedWindow_wrong ===
这几句我都看了，还是没明白你想让我改哪一笔。
它们没对上同一件事。先别管总数，得看同样正常出勤时，固定那项到底多少。 # thought
-> END

=== fixedWindow_defer ===
没事，你再看看。固定工资这块你想确认哪一项？
我先把这句话记下来。原文还没找齐，现在争也说不清。 # thought
-> END

=== fixedOffer ===
……看到了。「固定」那两个字确实是我打的，不能说你听错了。
我拿着聊天记录去申请了。税前固定七千四，可以写进正文。八千固定，我这边确实批不下来。
+ [七千四可以。正文和薪酬确认单的固定项一起改，别留两个数。 # choice:accept]
    -> fixedApply
+ [还有没有可能按面试的八千报一次？就按固定这一项报。 # choice:counter]
    -> fixedFinal
+ [七千四我先不答应，让我再看看手头的版本。 # choice:later]
    -> desk

=== fixedFinal ===
我刚又问了一遍。七千四是运营已经同意加过一次的数，我现在能写。八千没有批复，我不能空口答应。
+ [那就把七千四写进正文，确认单也改成一样的。 # choice:accept]
    -> fixedApply
+ [非八千不谈。没有这个数，别再发别的条件。 # choice:insist]
    -> fixedBlocked
+ [先别改。我想先把别的条款核一遍。 # choice:later]
    -> desk

=== fixedApply ===
两份都改好了，固定七千四。你看一下那一栏。
# amend:fixed
七千四总算落进两份文件了。再对一眼，别又冒出别的数。 # thought
-> desk

=== reviewSalary ===
对，试用期也是七千四。确认单就一个固定工资项，没有再给你套个试用期价格。
-> desk

=== weekend ===
周六看展期安排。新人一般一个月两场，运营会直接排。
+ [能看一下拟排班吗？我想知道哪两天、是不是必须到场。 # choice:roster]
    -> roster
+ [假设场馆改期，我只去了一次。那一次的工时是单独结的吧？ # choice:one]
    -> weekendWindow
+ [排几次先不急。薪酬组拿哪份文件算周六的钱？ # choice:lines]
    -> weekendPay

=== roster ===
{has_file("roster"):
就是刚才那份。两个周六都缺人，具体日期还可能变。
- else:
运营的排班发你。这两个周六都缺人，排到了就得到。日期有变会再通知。
# file:roster
}
+ [排班上写了可能改期。第二场取消的话，第一场的报酬还照结吗？ # choice:one]
    -> weekendWindow
+ [我知道要去现场了。负责算钱的人按什么文件结？ # choice:lines]
    -> weekendPay
+ [周六的轮值能取消吗？这两天对我来说也是时间。 # choice:cancel]
    -> weekendHard

=== weekendPay ===
{has_file("payroll"):
薪酬组就照发你的确认单算。你想问哪种情况？
- else:
按确认单算。排班临时变很正常，这张单是统一交给薪酬组的。
# file:payroll
}
+ [如果第二场没排到我，第一场还是按出勤单独结？ # choice:one]
    -> weekendWindow
+ [先看看排班。我得知道这个『两次』是不是我自己能决定。 # choice:roster]
    -> roster
+ [我先把面试时说的结法找出来。 # choice:later]
    -> desk

=== weekendHard ===
两个周六的场地都订了，我手里也真没人。轮值我改不了，钱怎么算可以谈。
+ [那先不动排班。只去一次时，那一次会单独结吗？ # choice:one]
    -> weekendWindow
+ [不取消轮值就不谈。你现在给我一句周六不用去。 # choice:insist]
    -> weekendBlocked
+ [那先把给薪酬组的结算单发我，我回头再看排班。 # choice:lines]
    -> weekendPay

=== weekendBlocked ===
我不能替运营点头。如果你只接受取消轮值，那这条只能先放下。
# deadlock:weekendBlocked
-> END

=== weekendWindow ===
按实际出勤算，去一场就给一场的钱。确认单写两场，是按平时排班来的，跟我面试说的另算是一回事。
# proof:weekendWindow
-> END

=== weekendWindow_step_1 ===
她说去一场就给一场的钱。确认单真是这么写的？得找发放条件那句。 # thought
-> END

=== weekendWindow_right_1 ===
你刚说去一场就给一场，可确认单写的是做满两次才发。要是第二场临时取消，我明明去了第一场，照这行也拿不到钱。能把按实际出勤另算写进去吗？ # player
-> weekendOffer

=== weekendWindow_mistake_1 ===
这是排班，只写你哪天要去，没写钱怎么算。
对，它能证明我得去，却证明不了只去一场给不给钱。得看薪酬单。 # thought
-> END

=== weekendWindow_mistake_2 ===
对，面试时我也是这么说的。这句跟我刚才说的一样，没冲突呀。
两边都说会另算。真正对不上的，应该是薪酬单上的发放条件。 # thought
-> END

=== weekendWindow_mistake_card ===
这是……饭卡？工资还是打银行卡的。你刚才问的是周六只去一场怎么算吧？
-> END

=== weekendWindow_wrong ===
这句还是没说明，只去一场到底给不给。
对，它没把「两次才发」写死。我再看看确认单上的条件。 # thought
-> END

=== weekendWindow_defer ===
行，我先看看排班和结算单，再回你。 # player
可以，想看哪份跟我说。
先不跟她绕。看看薪酬组那张单到底怎么写。 # thought
-> END

=== weekendOffer ===
对，这行确实是两次才发。只去一场，薪酬组照这张单就不会给。
这样，我把两次的门槛删掉，周六按现场记录另算。排班还得听运营的，这个我免不掉。
+ [可以。正文和确认单都写按实际工时另结，别再写必须做满两次。 # choice:accept]
    -> weekendApply
+ [谁记实际工时？我不想到了发工资才知道那天没记上。 # choice:check]
    -> weekendRecord
+ [这个改法我先记着。我再对一下现在的文本。 # choice:later]
    -> desk

=== weekendRecord ===
现场交接由运营主管签字，月底他核完工时交给薪酬。我让他们把这笔钱单列在工资条上，也写进确认单。
+ [好，按记录另结和工资单单列都写进去，我核对改稿。 # choice:accept]
    -> weekendApply
+ [我先回头看看其他条款，这个改法暂时不确认。 # choice:later]
    -> desk

=== weekendApply ===
改好了。「两次才发」删掉了，记多少工时就按多少结。
# amend:weekend
这回只去一场也有凭有据了。再把改过的那行看一遍。 # thought
-> desk

=== reviewHours ===
工资条会单列这笔钱。工时表在运营那边，平时不单独发。
+ [只看金额，我看不出来哪一场有没有记上。能不能结算前把我自己的工时明细发我核一下？ # choice:request]
    -> recordsOffer
+ [明白，这一条我先看到这儿。 # choice:later]
    -> desk

=== recordsOffer ===
整张表有别人的信息，不能发。你自己的那份可以让运营单独给。漏了就找现场主管，核完再交薪酬。
+ [行，就把结算前发本人明细、漏记找运营核对这两点写进合同和确认单。 # choice:accept]
    -> recordsApply
+ [好，我先把这个答复记下来。 # choice:later]
    -> desk

=== recordsApply ===
加上了。结算前，运营会把你自己的明细发你；有漏记先找现场主管。两份文件都改了。
# amend:timeRecords
-> desk

=== recordsConfirmed ===
找现场主管。哪天、哪场说清楚，他会去对现场记录，再交薪酬组。
-> desk

=== desk ===
{in_game():
    # desk
    -> END
}
+ [预览 · 合同期限 # choice:preview_term]
    -> ask_term
+ [预览 · 岗位与地点 # choice:preview_role]
    -> ask_role
+ [预览 · 工作时间 # choice:preview_hours]
    -> ask_hours
+ [预览 · 劳动报酬 # choice:preview_salary]
    -> ask_salary
+ [预览 · 社会保险 # choice:preview_insurance]
    -> ask_insurance
+ [预览 · 文本与附件 # choice:preview_copy]
    -> ask_copy
+ [预览 · 确认工时的后续交涉 # choice:preview_records]
    -> ask_hours_2

=== ask_term ===
我想先确认一下这一年的期限和试用期是怎么算的。 # player
-> term

=== ask_role ===
岗位和地点这条，我想先确认平时在哪儿上班、现场要做什么。 # player
-> role

=== ask_hours ===
工作时间这条我想问一下。正文说标准工时，后面又写布撤展轮值，这个实际怎么排？ # player
-> weekend

=== ask_hours_1 ===
工作时间这条我再确认一下。月末工时发给我后，有漏记找谁？ # player
-> recordsConfirmed

=== ask_hours_2 ===
工作时间这条我想再确认一下。现在按实际工时结，我自己能看到主管记的工时吗？ # player
-> reviewHours

=== ask_salary ===
劳动报酬这条，我想把合同上的八千问清楚再签。 # player
-> salary

=== ask_salary_1 ===
我再确认一下改过的报酬。固定七千四，试用期也按这个数吗？ # player
-> reviewSalary

=== ask_insurance ===
我想确认下参保的起点。试用期也从入职开始办吗？ # player
-> insurance

=== ask_copy ===
最后这条说正文和附件一起签。我签之前能看到哪些文件？ # player
-> copies

=== end_topic ===
这条先谈到这儿，我再看一下合同。 # player
-> desk

=== stale ===
你圈的是上一版，那句已经换掉了。我们得按现在这份说，回到刚才那条。
-> END

=== refused ===
我知道你心里还不踏实。可聊了这么久，我们好像还是谈不到一块儿。
我先把签署停一下吧，也不耽误你看别的机会。
她要把流程关了。要不再把刚才那条说清楚？实在不行，也只能到这儿。 # thought
-> END

=== resume ===
先别关。我只想把刚才那条说清楚，能再谈一次吗？ # player
行，就只说刚才那条。文件都还在，你按最新版看。
-> END

=== refused_leave ===
好，我这边就不往下签了。谢谢。 # player
-> END

=== finish_sign ===
我这边就按当前版本签了。 # player
好。正文和确认单一起签，签完记得两份都存好。
# file:payroll
-> END

=== finish_leave ===
这份合同我先不签了，辛苦你。 # player
行，我跟运营说一声，这边先把流程关掉。
-> END

=== function has_file(id) ===
~ return false

=== function has_clue(id) ===
~ return false

=== function in_game() ===
~ return false
