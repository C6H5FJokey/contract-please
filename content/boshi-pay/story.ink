// Copyright (c) 2026 C6H5FJokey
// SPDX-License-Identifier: CC-BY-4.0

EXTERNAL has_file(id)
EXTERNAL has_clue(id)
EXTERNAL in_game()

-> opening

=== opening ===
合同发你了，运营那边想下月就有人进场。你先看，哪条要确认就跟我说。
我先把合同翻一遍。有哪条没看明白，我就从那一条问起。 # thought
-> desk

=== term ===
从报到那天算一年。前两个月是试用期，已经算在这一年里了，转正不会重新起算。
+ [签之前能把起止日期填好给我看一下吗？ # choice:dates]
    -> termDates
+ [明白，试用期包含在一年里。我接着看。 # choice:done]
    -> desk

=== termDates ===
可以，等我们定下报到日，我把起止日期填进签署版。你拿到的时候再核一下。
-> desk

=== role ===
平时去市展务中心的二号馆报到。进场以后主要跟签到、对物料，布展和撤展的时候跟着现场负责人走。
+ [项目换了就要去别的城市吗？ # choice:locations]
    -> roleLocations
+ [好，地点和日常工作我都记下了。 # choice:done]
    -> desk

=== roleLocations ===
这次招的是展务中心这个岗位。现在没有外地安排。以后真要长期调地点，我们会另外跟你谈。
-> desk

=== insurance ===
对，试用期也按实际到岗日期登记。入职当天把参保资料给我，我转给人事办。
+ [个人扣的那部分，我能在哪里核对？ # choice:records]
    -> insuranceRecords
+ [了解，参保起点按入职日。那我先继续看合同。 # choice:done]
    -> desk

=== insuranceRecords ===
个人扣的部分在工资条上单独列。你查到的参保记录要是跟报到日期对不上，直接发我，我让人事核。
-> desk

=== copies ===
这份正文和薪酬确认单一起签。运营发的排班会变，不跟签署包绑在一起。签完两份你都能下载。
+ [那先把确认单也发我吧。我想签前把两份一起看。 # choice:files]
    -> copyPayroll
+ [好，签完我会把两份一起存下来。 # choice:done]
    -> desk

=== copyPayroll ===
{has_file("payroll"):
确认单已经发在上面了。有改稿的话，以最后发的那版为准。
- else:
可以，薪酬组给我的就是这份。你先跟正文一起看。
# file:payroll
}
-> desk

=== salary ===
八千是运营批的岗位报价，发薪日期也在正文上。你是想确认哪一部分？
+ [工资条上，固定工资那一栏会填多少？我想核一下明细。 # choice:lines]
    -> payroll
+ [面试那天说的是正常出勤固定八千。今天发来的也是这个意思？ # choice:confirm]
    -> fixedWindow
+ [如果项目改期，一个周六都没排到我，到账会少吗？ # choice:noShift]
    -> conditional

=== conditional ===
那要看当月排班。我没法拿一个还没排出来的月给你算工资。
但项目排得挺满的，来了你就知道，周六一般都有活儿。
+ [先不算哪一月。零次周六也照发的那一项，单子上是多少？ # choice:lines]
    -> payroll
+ [排班可以变，面试答应的固定部分总不会跟着变吧？ # choice:confirm]
    -> fixedWindow
+ [下个月先给我看一下。我得知道周六轮值是怎么算进来的。 # choice:roster]
    -> earlyRoster

=== earlyRoster ===
运营的拟排班我能发。先别按具体日期订票，场馆那边还可能动。
# file:roster
+ [看到了。现在能把工资拆分发我吗？我想把排班和固定工资分开看。 # choice:lines]
    -> payroll
+ [这两场先按要到场算。固定八千跟这两场无关，对吧？ # choice:confirm]
    -> fixedWindow
+ [排班我先记下来。我再回合同看看还有什么要问的。 # choice:later]
    -> desk

=== payroll ===
{has_file("payroll"):
工资明细就在刚才发的确认单上。你要核的是哪一项？
- else:
工资条要入职以后才有。跟合同一起走的是这个单子，薪酬组按它录数。你先看。
# file:payroll
}
+ [面试微信里你特意说了『固定』。跟这张单上的固定项是一回事吗？ # choice:confirm]
    -> fixedWindow
+ [这个写法我签不了。你先把固定八千填上，其他再谈。 # choice:insist]
    -> fixedHard
+ [固定的先放一下，我回去核对一下手头的文本。 # choice:later]
    -> desk

=== fixedHard ===
表是薪酬组批的，我不能自己把数填上去。你让我拿什么去找他们重批？
+ [就拿面试谈的口径。你当时说的固定工资，是不是确认单上这一栏？ # choice:confirm]
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
我面试报的就是审批过的那个数。你说的『固定』和确认单上的固定工资是一个口径，这里没改过。
# proof:fixedWindow
-> END

=== fixedWindow_step_1 ===
她说固定工资没改过。我先找找，现在发来的材料是怎么写这笔工资的？ # thought
-> END

=== fixedWindow_step_2 ===
那面试时她给我的是哪个数？我得找出说的也是正常出勤的那一句。 # thought
-> END

=== fixedWindow_right_1 ===
我把两句放在一起了。面试微信上你说周一到周五正常出勤，固定八千；这张确认单写同样是正常工时，固定只有六千八。差的一千二不是换个叫法就能补上的。能按固定工资这一项重新确认吗？ # player
-> fixedOffer

=== fixedWindow_mistake_1 ===
正文写的是月度薪酬标准，没写八千全是固定的。你这两句一个是总数，一个是明细。我刚才说的是面试报的固定项。
-> END

=== fixedWindow_wrong ===
这几句我看了。得是同一个岗位、同样出勤下的固定工资，才能直接比这两个数。我们先回到固定项上。
-> END

=== fixedWindow_defer ===
没事，你再看看。固定工资这块你想确认哪一项？
我先把这句话记下来。原文还没找齐，现在争也说不清。 # thought
-> END

=== fixedOffer ===
……看到了。那天『固定』是我打的，我不能说你听错了。
我拿这条记录去争了一下。现在能给到税前固定七千四，能写进正文。八千固定我确实拿不到。
+ [七千四可以。正文和薪酬确认单的固定项一起改，别留两个数。 # choice:accept]
    -> fixedApply
+ [还有没有可能按面试的八千报一次？就按固定这一项报。 # choice:counter]
    -> fixedFinal
+ [七千四我先不答应，让我再看看手头的版本。 # choice:later]
    -> desk

=== fixedFinal ===
我刚问过。七千四是运营同意加过一次的数，我现在可以把它写下来。八千我手里没有这个批复。
+ [那就把七千四写进正文，确认单也改成一样的。 # choice:accept]
    -> fixedApply
+ [非八千不谈。没有这个数，别再发别的条件。 # choice:insist]
    -> fixedBlocked
+ [先别改。我想先把别的条款核一遍。 # choice:later]
    -> desk

=== fixedApply ===
两份都改了。固定是七千四，你核对一下这一栏。
# amend:fixed
七千四现在写进两份文件了。我得按这版核对。 # thought
-> desk

=== reviewSalary ===
对，试用期也是七千四。确认单只有一个固定工资项，我们没有另外给你套试用期的数。
-> desk

=== weekend ===
周六那块跟着展期走。新人一般一个月两场，运营会把人排进去。
+ [能看一下拟排班吗？我想知道哪两天、是不是必须到场。 # choice:roster]
    -> roster
+ [假设场馆改期，我只去了一次。那一次的工时是单独结的吧？ # choice:one]
    -> weekendWindow
+ [排几次先不急。薪酬组拿哪份文件算周六的钱？ # choice:lines]
    -> weekendPay

=== roster ===
{has_file("roster"):
就是刚才那份拟排班。两个周六人手都紧，具体日期还有可能动。
- else:
我把运营发的排班给你。这两个周六我们都缺人，排到就得去。日期有变他们会再通知。
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
薪酬组按已经发你的确认单走。你说的是哪种排班？
- else:
用的是确认单。排班临时变很正常，这份单子是统一给薪酬组的。
# file:payroll
}
+ [如果第二场没排到我，第一场还是按出勤单独结？ # choice:one]
    -> weekendWindow
+ [先看看排班。我得知道这个『两次』是不是我自己能决定。 # choice:roster]
    -> roster
+ [我先把面试时说的结法找出来。 # choice:later]
    -> desk

=== weekendHard ===
这两个周六的场地都订了，我手上也没别的人。改轮值我做不了主，结算你可以跟我谈。
+ [那先不动排班。只去一次时，那一次会单独结吗？ # choice:one]
    -> weekendWindow
+ [不取消轮值就不谈。你现在给我一句周六不用去。 # choice:insist]
    -> weekendBlocked
+ [那先把给薪酬组的结算单发我，我回头再看排班。 # choice:lines]
    -> weekendPay

=== weekendBlocked ===
我不能代运营答应。这条如果没别的谈法，就先放一下吧。
# deadlock:weekendBlocked
-> END

=== weekendWindow ===
按实际出勤结，去一场就算一场。确认单写两场是按常规排班来的，和我面试跟你说的另算是一回事。
# proof:weekendWindow
-> END

=== weekendWindow_step_1 ===
只去一次也会单独结？我手里的文件真是这么写的吗？ # thought
-> END

=== weekendWindow_right_1 ===
你刚说去一场就算一场。可确认单写的是做满两次才发。要是第二场临时取消，我第一场明明去了，按这行也拿不到钱。能把按实际出勤另结写进去吗？ # player
-> weekendOffer

=== weekendWindow_mistake_1 ===
这是运营的排班，只写了你哪天要到。你问的是只去一场怎么算，得看薪酬组拿什么发钱。
-> END

=== weekendWindow_mistake_2 ===
对，面试时我也是这么说的。你圈的这句和我现在说的一样啊。
-> END

=== weekendWindow_wrong ===
我说的是只去一场还发不发。这句没写只去一场就没有钱。要不先回去看看单子？
-> END

=== weekendWindow_defer ===
好，我先看看排班和结算单，再回你。 # player
可以。你要看哪份，跟我说。
先不跟她争这一句。我得看看薪酬组手里的那份写了什么。 # thought
-> END

=== weekendOffer ===
是，这行写的是两次才发。只去一场，薪酬组照这张单就不会发这笔钱。
这样，我去掉两次的门槛，超出正常工时的周六报酬按现场记录另结。排班还得跟运营走，这个我不能帮你免掉。
+ [可以。正文和确认单都写按实际工时另结，别再写必须做满两次。 # choice:accept]
    -> weekendApply
+ [谁记实际工时？我不想到了发工资才知道那天没记上。 # choice:check]
    -> weekendRecord
+ [这个改法我先记着。我再对一下现在的文本。 # choice:later]
    -> desk

=== weekendRecord ===
现场交接是运营主管签字，月底他会核工时，再给薪酬。我让他们把这笔在工资单上单列，写进确认单。
+ [好，按记录另结和工资单单列都写进去，我核对改稿。 # choice:accept]
    -> weekendApply
+ [我先回头看看其他条款，这个改法暂时不确认。 # choice:later]
    -> desk

=== weekendApply ===
更新好了。两次才发那行已经拿掉，记多少工时就按多少单独结。
# amend:weekend
现在只去一场也有结算依据了。我把改过的那行再看一眼。 # thought
-> desk

=== reviewHours ===
工资单上会单列金额。工时表是运营那边的，平时我们不单独发。
+ [只看金额，我看不出来哪一场有没有记上。能不能结算前把我自己的工时明细发我核一下？ # choice:request]
    -> recordsOffer
+ [明白，这一条我先看到这儿。 # choice:later]
    -> desk

=== recordsOffer ===
整张工时表上有别人的信息，不能发。不过你自己的工时可以让运营单独发。发现漏记就找现场主管，他们核完再交薪酬。
+ [行，就把结算前发本人明细、漏记找运营核对这两点写进合同和确认单。 # choice:accept]
    -> recordsApply
+ [好，我先把这个答复记下来。 # choice:later]
    -> desk

=== recordsApply ===
加上了。结算前运营会发你本人的明细，有漏记先找现场主管。两份文件都更新了。
# amend:timeRecords
-> desk

=== recordsConfirmed ===
找现场主管。你把哪一天、哪一场说清楚，他可以回去对现场记录，再交给薪酬组。
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
你引的是上一版已经换掉的那句话。我得按现在发你的这份核。我们回到刚才那一项。
-> END

=== refused ===
我知道你还没放心。不过这轮聊下来，我们好像很难在这份合同上达成一致。
我先把签署流程停一下，也不耽误你看别的机会了。
她已经要停签了。我还能试着把话说回刚才那一条，或者就到这儿。 # thought
-> END

=== resume ===
先别关。我只想把刚才那条说清楚，能再谈一次吗？ # player
行。我们就说刚才那一条。发过的文件还在，你照最新那份看。
-> END

=== refused_leave ===
好，我这边就不往下签了。谢谢。 # player
-> END

=== finish_sign ===
我这边就按当前版本签了。 # player
收到。正文和确认单是一起走的，签完记得把两份都存一下。
# file:payroll
-> END

=== finish_leave ===
这份合同我先不签了，辛苦你。 # player
明白。我跟运营说一声，这边先把流程关掉。
-> END

=== function has_file(id) ===
~ return false

=== function has_clue(id) ===
~ return false

=== function in_game() ===
~ return false
