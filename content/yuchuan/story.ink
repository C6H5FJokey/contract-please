EXTERNAL has_file(id)
EXTERNAL has_amendment(id)
EXTERNAL has_proof(id)
EXTERNAL in_game()
VAR mengJoined = false
VAR zhengJoined = false
VAR offeredA1 = false
VAR offeredA2 = false
VAR offeredA3 = false
VAR offeredA4 = false
VAR offeredA5 = false
VAR offeredA6 = false

-> opening

=== opening ===
合同和附件目录发你了。孟乔那边看过你试做的小样，想让你下周过来。
七千六还是面试说的固定数，额外工时另算。正文里有些项目用的叫法，你先看，有问题就在这里问。
# file:D00
# file:D02
这次金额倒是对上了。签约的公司、前几个月怎么安排，也得一起看。 # thought
{not in_game():
    -> preview
}
-> desk

=== preview ===
+ [签约主体 # choice:entity]
    -> topic1
+ [入职阶段 # choice:employment]
    -> topic2
+ [岗位与工时 # choice:hours]
    -> topic3
+ [报酬与结算 # choice:pay]
    -> topic4
+ [社会保险 # choice:insurance]
    -> topic5
+ [保密与离职 # choice:confidentiality]
    -> topic6
+ [地点与设备 # choice:equipment]
    -> topic7
+ [文本与交接 # choice:files]
    -> topic8

=== desk ===
# desk
-> END

=== leave_now ===
# leave
-> END

=== end_topic ===
这条先谈到这里。我再看看手里的文件。 # player
-> desk

=== stale ===
这一句我们刚才已经换掉了，旧版留着是让你核对改过什么。你要说现在还有这个条件，得看现行那一段。
旧句能说明之前有什么问题。我看一下新旧两行。 # thought
-> END

=== refused ===
我们这轮先停一下吧。现在有几项一直对不上，我暂时把签署流程挂起，也不耽误你看别的机会。
这次谈不下去了。我可以把刚才没说清的那一项重新说，也可以就此离开。 # thought
-> END

=== resume ===
可以，我们从刚才那一项接着谈。你已经拿到的文件和我们确认过的改稿都在，按现在的版本说。
-> END

=== refused_leave ===
好，这次就不继续了。 # player
明白，材料你可以留存，签署这边我关闭。
有些问题我看出来了，有些还没说清。这次先到这里。 # thought
-> END

=== finish_leave ===
这份我先不签了。已经聊清楚的我会留好，这次就到这里。 # player
好，我把流程关掉。报到就不安排了。
{mengJoined:
    明白，我把这份任务先另作安排。 # speaker:meng
}
我没有得到这份工作，也没有把没想清的条件签下去。下一份需要问什么，我更清楚了。 # thought
-> END

=== finish_sign ===
我按现在这套版本签。正文和附件都保留给我。 # player
收到，我发签署包。你保存完整那套，之后按约定的报到日联系。
# signing:send
{
- has_amendment("A1") && has_amendment("A2") && has_amendment("A3") && has_amendment("A4") && has_amendment("A5") && has_amendment("A6"):
    {mengJoined:
        那我按工作安排给你准备第一周的任务。先交两份让我看，别自己憋着改一整天。 # speaker:meng
    }
    工作还是要做，交付也有人盯。但谁负责、哪天开始、离开怎么结，这次写在同一套文件里了。 # thought
- has_amendment("A1") || has_amendment("A2") || has_amendment("A3") || has_amendment("A4") || has_amendment("A5") || has_amendment("A6"):
    谈下来的几处已经写进去了，其他条款仍是这次签下的条件。我把最后这套存好。 # thought
- else:
    这次签的是最初那套。附件也得一起存，不能只留一张写着七千六的首页。 # thought
}
-> END

=== topic1 ===
{has_amendment("A1"):
    -> T1R
}
{has_proof("P1"):
    刚才谈到的改法，我想接着确认。 # player
    -> T1resume
}
-> T1A

=== topic2 ===
{has_amendment("A2"):
    -> T2R
}
{has_proof("P2"):
    刚才谈到的改法，我想接着确认。 # player
    -> T2resume
}
-> T2A

=== topic3 ===
-> T3A

=== topic4 ===
{has_proof("P3") && not has_amendment("A3"):
    -> pending_pay
}
{has_proof("P4") && not has_amendment("A4"):
    -> pending_pay
}
{has_amendment("A4"):
    -> T4S
}
{has_amendment("A3"):
    -> T4R
}
-> T4A

=== pending_pay ===
刚才谈到的结算改法，我想接着核一下。 # player
+ {has_proof("P3") && not has_amendment("A3")} [确认七天计付的改法。 # choice:confirm-days]
    {offeredA3: -> T4FOptions}
    -> T4F
+ {has_proof("P4") && not has_amendment("A4")} [确认离场申报的改法。 # choice:confirm-exit]
    {offeredA4: -> T4MOptions}
    -> T4L
+ [我想再看一遍材料，先谈另一处。 # choice:check-other]
    -> pay_review

=== pay_review ===
你想核对首周的计付条件，还是离场后的申报办法？
+ {not has_amendment("A3")} [我想再核对第一周的计付。 # choice:days]
    {has_proof("P3"): -> T4F}
    -> T4C
+ {not has_amendment("A4")} [我想弄清离场后怎么申报。 # choice:exit]
    {has_proof("P4"): -> T4L}
    -> T4H
+ [这两件事我先记下了。 # choice:later]
    -> desk

=== topic5 ===
{has_amendment("A5"):
    -> T5R
}
{has_proof("P5"):
    刚才谈到的改法，我想接着确认。 # player
    -> T5resume
}
-> T5A

=== topic6 ===
{has_amendment("A6"):
    -> T6R
}
{has_proof("P6"):
    刚才谈到的改法，我想接着确认。 # player
    -> T6resume
}
-> T6A

=== topic7 ===
-> T7A

=== topic8 ===
-> T8A

=== T1A ===
面试、办公地址都是与川数字，签约却是商务咨询。两边分别负责什么？ # player
一个体系里的公司。内容组在数字这边，合同和发款由商务这边办理。你工位和岗位都不变。
+ [我问的不是工位。如果十号钱没到，我找谁，哪家公司必须给我付？ # choice:pay]
    -> T1B
+ [先给我看一下正文提的分工单。我想知道哪边签、哪边拨款。 # choice:file]
    -> D05_T1C
+ [那我请假、交稿、核出勤，都是找数字这边的主管？ # choice:management]
    -> T1D

=== T1B ===
你找我就行。我会找结算组，不用你分别跑两家公司。
+ [找你是联系办法。我想问的是：数字那边还没拨款，商务也要按十号先付吗？ # choice:promise]
    -> T1E
+ [这张分工单能发我吗？我把付款那一段看完再问。 # choice:file]
    -> D05_T1C
+ [那你在群里说一句你负责，我就不看公司这一栏了。 # choice:personal]
    联系我没问题，但工资不是我个人发。公司之间怎么走还是按文件。
    -> T1B

=== D05_T1C ===
# request:D05
-> T1C

=== T1C ===
签约、考勤、拨款都列了。主要是省得你以后找错人。
联系人列清了，没到账时要不要先付，可能是另一件事。 # thought
+ [数字晚拨一天，商务是先按期付，还是我跟着等？ # choice:promise]
    -> T1E
+ [我还想确认实际管我的人。 # choice:management]
    -> T1D
+ [我先把正文和这张单放一起看。 # choice:later]
    -> desk

=== T1D ===
-> invite_meng ->
请假、交稿、出勤都找我。我在数字内容组。商务的人不会给你排今天做什么。 # speaker:meng
项目换了，还是这个内容组的岗位？ # player
是。不是这个客户做完，你的岗位就跟着没了。首周安排里也写了接下来要接的常规工作。 # speaker:meng
# file:D06
+ [管理这边清楚了。发钱那边如果没收到拨款，还要按期付给我吗？ # choice:promise]
    -> T1E
+ [这份安排我留着。我回合同看一下入职阶段。 # choice:later]
    -> desk
+ [孟乔能直接替公司答应工资一定到账吗？ # choice:personal]
    我能核你哪天来、做了什么。拨款不是我经办，付款承诺要公司确认。 # speaker:meng
    -> T1C

=== T1E ===
{has_proof("P1"):
    -> T1resume
}
商务既然跟你签，就会按约定日期先付。数字往商务拨款是内部的事，不会影响你这边。
# proof:P1
-> END

=== T1F ===
-> invite_zheng ->
这张单是把两边账分开。真有拨款没跟上，我会协调，不会让你挨个找。 # speaker:zheng
+ [那就写明不等内部拨款。数字实际安排工作，能不能由数字签，也由数字按期付？ # choice:direct]
    -> T1G
+ [你在群里保证十号能发，我先信这个。 # choice:informal]
    -> T1H
+ [那就请数字和商务都在付款承诺上签字，两边都承担责任。 # choice:joint]
    -> T1I

=== T1resume ===
{offeredA1:
    -> T1GOptions
}
-> T1F

=== T1G ===
~ offeredA1 = true
这一个岗位可以转数字签，商务继续做资料经办。内容组本来就有这个用人预算，换签约路径我可以批，但得把签署包里的公司一起换。 # speaker:zheng
写清商务只是经办。以后它有没有划款，不能变成数字不付我的理由。 # player
可以。数字负责岗位管理和按期支付，内部经办不改变责任。许然按这个出。 # speaker:zheng
-> T1GOptions

=== T1GOptions ===
+ [按这个改，我看正文和分工单的同一处。 # choice:accept]
    -> applyA1
+ [变成数字签，七千六或报到日期会动吗？ # choice:budget]
    不动。这次改的是谁承担责任。 # speaker:zheng
    -> T1GOptions
+ [我先不确认，想把其他安排也看一下。 # choice:later]
    -> desk

=== T1H ===
我能答应有问题我来处理。文件暂时还是这套，先别为内部流程卡住报到。 # speaker:zheng
他说的是他会处理，没说单子上这条不再执行。 # thought
+ [我需要的是付款公司不会按这条等拨款。还是请把它改掉。 # choice:write]
    -> T1G
+ [这次先保留原文，我继续看。 # choice:later]
    -> desk
+ [那就写成由你个人承担所有工资。 # choice:personal]
    公司发工资，不能改成我个人欠你。 # speaker:zheng
    -> T1F

=== T1I ===
我可以让数字直接签、按期付。商务只做经办，再加一份两家公司共同承担的承诺，我这次不批。 # speaker:zheng
两边都签当然更稳。但他现在给的是数字独自负责，我得决定这个方案能不能接受。 # thought
+ [好，先把数字不等内部拨款、按期支付写明确。 # choice:direct]
    -> T1G
+ [只签一家我不接受，你继续去批两家共同承担，别给我其他方案。 # choice:insist]
    这次我给不了两家公司共同承诺。我们先停在这个分歧上。 # speaker:zheng
    # deadlock:L1
    -> END
+ [这个安排我仍然不接受，我不签了。 # choice:leave]
    -> leave_now

=== T1R ===
现在数字是甲方。商务如果还发通知或经办转款，我以后还是找你联系？ # player
对，联系人还是我。数字承担的责任不会因为通知是谁发的再变回去。
+ [给我定位一下现在写明责任的那一段。 # choice:locate]
    # locate:D05.03
    -> desk
+ [那实际工作仍然由孟乔安排？ # choice:management]
    {mengJoined:
        对，任务和出勤还归我。 # speaker:meng
    - else:
        还是孟乔负责分任务和核出勤。
    }
    -> desk
+ [清楚了，我再看别的。 # choice:later]
    -> desk

=== T2A ===
我已经毕业了，面试谈的也是全职。为什么先签三个月的岗位实践？ # player
应届生进来都有个熟悉过程。工资照谈好的给，先跟着组里做，适应了再把正式手续办齐。
+ [我的登记表上现在写的是已毕业，还是在校生？ # choice:form]
    -> D03_T2B
+ [这三个月是上课和练习，还是从第一周就接正式任务？ # choice:work]
    -> D06_T2C
+ [同样要考察岗位，为什么不能放在劳动合同的试用期里？ # choice:probation]
    -> T2D

=== D03_T2B ===
# request:D03
-> T2B

=== D06_T2C ===
-> invite_meng ->
# request:D06
-> T2C

=== T2B ===
毕业状态没录错。实践人员是这批入组的类别，不是说你还在学校。
她知道我毕业，也知道我来找工作。还得对上这三个月实际要做的事。 # thought
+ [那请孟乔说清楚第一周的任务是不是正式交付。 # choice:work]
    -> D06_T2C
+ [已经不是学校实习，为什么不从报到就按劳动合同走？ # choice:probation]
    -> T2D
+ [登记表先留着，我核对一下已有的面试记录。 # choice:later]
    -> desk

=== T2C ===
第一天先开账号、讲半小时操作规范，然后接资讯和尺寸适配。不是你练完了我丢掉，是我复核完要发出去。 # speaker:meng
如果第一周没做完，就得我继续改到能交？ # player
对。我会告诉你哪儿不合要求，也会带你改。但这份活归你，不是坐旁边看我做。 # speaker:meng
+ [那我请许然把就业身份和这份工作安排一起核一下。 # choice:probation]
    -> T2D
+ [你说会带我，能否把所有任务都改成不用交付的练习？ # choice:practice]
    这个岗位就是补交付的人。带你熟悉不等于三个月都不承担任务。 # speaker:meng
    -> T2C
+ [第一周的量我知道了。我先回去看合同。 # choice:later]
    -> desk

=== T2D ===
{has_proof("P2"):
    -> T2resume
}
这三个月主要是学习适应，还没按全职就业人员使用，所以先不走劳动合同。和登记、工作安排并不冲突。
# proof:P2
-> END

=== T2E ===
-> invite_zheng ->
你说是来长期工作的，我明白。我们也得知道新人能不能接得住，三个月不是拿来让你白做的。 # speaker:zheng
+ [可以考察。我接受把试用写进劳动合同，不接受先把实际工作算成实践。 # choice:employment]
    -> T2F
+ [先把文件名字换成劳动合同，里面的三个月不动也行。 # choice:title]
    -> T2G
+ [试做和面试都过了，我想取消试用，直接签没有试用期的一年合同。 # choice:waive]
    -> T2H

=== T2resume ===
{offeredA2:
    -> T2FOptions
}
-> T2E

=== T2F ===
~ offeredA2 = true
按一年劳动合同报，两个月试用。七千六不降，合同从十二月一号算，不是两个月之后再起算。 # speaker:zheng
试用也要按实际工作记录来。我不能到时候才知道你们用了另一套没给我看的标准。 # player
可以。就按已经给你的岗位任务和书面告知的要求处理，不能把实践结束直接当成让你走人的理由。 # speaker:zheng
-> T2FOptions

=== T2FOptions ===
+ [按这个改。正文、登记类别一起更新，已有的改稿保留。 # choice:accept]
    -> applyA2
+ [劳动合同的甲方是哪一家？ # choice:entity]
    {has_amendment("A1"):
        数字公司。
    - else:
        目前仍是商务。这次先改身份，主体问题可以接着谈。
    }
    -> T2FOptions
+ [我先考虑一下这个试用安排。 # choice:later]
    -> desk

=== T2G ===
如果只是名称变了，里面还是三个月实践、结束后再正式录用，那实际还是刚才那套。
我想改的是从哪天按什么身份工作，不是封面上的几个字。 # thought
+ [那还是按一年合同、两个月试用具体改。 # choice:employment]
    -> T2F
+ [暂时不改，我把其他条款看完。 # choice:later]
    -> desk
+ [我不接受现有方案，这份先不签。 # choice:leave]
    -> leave_now

=== T2H ===
试做只能看一份小样，我还没看到你连续接任务的情况。这次方案要保留两个月试用，工资不打折。完全免试用我不批。 # speaker:zheng
+ [那就把试用、待遇和考察依据写清。 # choice:employment]
    -> T2F
+ [我只接受免试用，你现在就按这个批，其他改法不用再说。 # choice:insist]
    那我们目前在这项上谈不拢。 # speaker:zheng
    # deadlock:L2
    -> END
+ [我不接受这份岗位安排，先不签。 # choice:leave]
    -> leave_now

=== T2R ===
十二月一号就开始算合同，两个月试用也包含在一年里面，对吗？ # player
对，没有在前面再加三个月实践。固定工资还是七千六。
{not has_amendment("A5"):
    保障选择单还是另一份文件，你要确认办理方式的话，我们可以再核那一项。
}
身份改了，其他附件还是得按各自的现行文字看。 # thought
-> desk

=== T3A ===
岗位这条能具体一点吗？我第一周要做什么，哪些材料能看？ # player
-> invite_meng ->
先接资讯整理和尺寸适配。发出去之前我会复核，但不是让你只旁观。 # speaker:meng
+ [给我看首周安排吧。我想知道交付量和复核怎么走。 # choice:schedule]
    -> D06_T3B
+ [我会接触客户报价、后台数据或者未公开计划吗？ # choice:access]
    -> D10_T3C
+ [正文写八小时，午休算不算在里面？ # choice:hours]
    -> T3D

=== D06_T3B ===
# request:D06
-> T3B

=== D10_T3C ===
# request:D10
-> T3C

=== T3B ===
第一周六条资讯、十二份适配。先交两份让我看，方向对了再做剩下的，别把十二份全做完才发现尺寸理解错了。 # speaker:meng
如果我当天做不完，会默认留下来补完吗？ # player
先说哪里卡住，我调整任务。真要额外安排工时，我在群里写清楚并记下来，不往七千六里面塞。 # speaker:meng
+ [这份安排我保存。我再去核入职阶段的写法。 # choice:later]
    -> desk
+ [我想知道做这些稿到底开放哪些资料。 # choice:access]
    -> D10_T3C
+ [这些任务都由你来核，出勤也是你确认？ # choice:attendance]
    对。交付和出勤分开记，你来了不等于稿一定合格，稿要改也不等于这一天没出勤。 # speaker:meng
    -> T3A

=== T3C ===
你用的都是已经公开的资料。报价、后台数据和还没发布的计划，当前岗位不开放，我也不会让你借别人的账号看。 # speaker:meng
+ [不开权限之外，会不会让我旁听会议或者帮忙转这些文件？ # choice:meetings]
    这版岗位安排没有。以后真加这些工作，要先把新增事项说清楚。 # speaker:meng
    -> T3A
+ [那我做过的公开稿件，离开以后能放进作品集吗？ # choice:portfolio]
    -> T3E
+ [这张权限确认我留着。 # choice:later]
    -> desk

=== T3D ===
九点半到六点半，中间一小时午休，不安排值班。实际正常工作是八小时。 # speaker:meng
起止时间相隔九小时，和工作八小时能同时成立。不能把午休直接当成多出来的工时。 # thought
+ [如果临时安排午休工作，还是要另记实际时间？ # choice:break]
    是。不能一边安排你做事，一边算你在休息。 # speaker:meng
    -> desk
+ [那我继续看实际任务。 # choice:schedule]
    -> D06_T3B
+ [只要起止隔了九小时，就必须把一小时午休也算加班。 # choice:overtime]
    你可以问午休有没有工作。现在这份安排是完整一小时不做事，不能直接多算。 # speaker:meng
    -> T3A

=== T3E ===
你可以保存公开页面链接，描述自己负责了什么。客户稿不是都归我们一个人所有，文件拷出去、写谁署名，要另看授权。 # speaker:meng
+ [那我不会把整个客户项目说成我一个人做的，先留公开链接。 # choice:public]
    这样没问题。以后需要我确认你做了哪一部分，可以单独来问。 # speaker:meng
    -> desk
+ [能把所有客户原文件都默认授权我带走吗？ # choice:source]
    这个我不能替客户答应。我只能确认你的工作部分。 # speaker:meng
    -> T3C
+ [我先看离职附件是不是也按这个范围写的。 # choice:later]
    -> desk

=== T4A ===
固定七千六这项对得上。我想问首次入组和离场的结算，正文为什么单独指到另一份说明？ # player
新人进来有个适应过程，系统也是按批次建记录。这个岗位不是做完一整月才给钱。
+ [假设我正常做了五天，之后依法办好离场，这五天怎么算？ # choice:days]
    -> T4B
+ [把结算说明发我，我看一下「建记录」到底指哪一步。 # choice:file]
    -> D04_T4C
+ [离场账号会收回吧？那我用什么报最后一次结算？ # choice:exit]
    -> T4H

=== T4B ===
还没入组就先想走，是不是对岗位还不放心？前几天会有人带你，我们希望你先把这一周做完。
+ [我现在问清楚，才好决定来不来。先按我确实完成了五天工作的情况回答。 # choice:promise]
    -> T4D
+ [那请孟乔说一下，这五天是在上课，还是接正式任务？ # choice:work]
    -> D06_T4E
+ [我不是说一定走。结算说明先给我，我看完再说。 # choice:file]
    -> D04_T4C

=== D04_T4C ===
# request:D04
-> T4C

=== D06_T4E ===
-> invite_meng ->
# request:D06
-> T4E

=== T4C ===
{not has_file("D04"):
    -> T4B
}
首周这段主要是看新人能不能留下来。结算组不想一天一个人地开单。
少开几张单是他们的流程。做过的班会不会变成没有报酬，是我的问题。 # thought
+ [所以未满七天只是晚一点结，还是这几天根本不转应付？ # choice:promise]
    -> T4D
+ [第一周实际交付的内容，我想请主管确认。 # choice:work]
    -> D06_T4E
+ [我先问另一种情况：已经够建单条件，但离场销号了，怎么申请？ # choice:exit]
    -> T4H

=== T4D ===
{has_amendment("A3"):
    -> T4R
}
{has_proof("P3"):
    -> T4F
}
只要实际做了，那几天的报酬都有。七天只是系统合起来办一批，不是没满七天就不算钱。
# proof:P3
-> END

=== T4E ===
第一周有正式任务，安排可以给你看。有人带，不代表做出来的东西不用。 # speaker:meng
但我也得说，接了任务最好按交接把事情留下。我不能猜你做了一半的稿在哪儿。 # speaker:meng
+ [交接我会办。那这五天的报酬，不会因为没满七天被拿掉吧？ # choice:promise]
    -> T4D
+ [你会给我自己的出勤和交接记录吗？ # choice:records]
    会给本人部分。出勤与接收记录留在我这儿，账号删了也还在。 # speaker:meng
    # file:D06
    -> T4C
+ [我先把这个工作安排和结算说明放一起看。 # choice:file]
    # file:D04
    -> desk

=== T4F ===
~ offeredA3 = true
这张表确实不是延后发，是没满七天就不进应付。它想解决的是人来了几天又走，带人的时间都花了。
我能按手续交接，不能把已经做过的五天变成没做。你们核的是我哪天工作，不该核我值不值得结工资。 # player
我把这两段转给结算组确认过了，可以把七天这条撤掉，从实际提供劳动的第一天算。出勤仍由孟乔核，报酬按原来的固定标准。
-> T4FOptions

=== T4FOptions ===
+ [改正文和结算说明，我看过新稿再继续。 # choice:accept]
    -> applyA3
+ [交接没做完，会不会又把前几天直接删掉？ # choice:handover]
    已做的劳动不能直接抹掉。交接问题另按事实处理，不能拿七天这条挡结算。
    -> T4FOptions
+ [这项改法先留着，我想把申报过程也看清。 # choice:later]
    -> desk

=== T4R ===
现在做过的班都算报酬了。我还想确认最后一笔钱怎么申报。 # player
结算说明后面有流程。交接完，在结算页提交，主管审核进应付表。
现在有资格结算了。离场后还能不能用这个页面，是下一件事。 # thought
+ [工作账号离场后会停吧？申请入口什么时候开？ # choice:exit]
    -> T4H
+ [我能先拿自己核过的出勤和交接记录吗？ # choice:records]
    -> T4I
+ [我先按目前这份保存，再看其他条款。 # choice:later]
    -> desk

=== T4H ===
{has_amendment("A4"):
    -> T4S
}
账号回收和结算不是同一个经办人。我把离场指引发你，里面有时间。
{has_file("D09") && has_file("D04"):
    # locate:D09
- else:
    # file:D09
    # file:D04
}
+ [我照着这份流程做，交接之后自己登结算页，就不会卡住？ # choice:promise]
    -> T4J
+ [有交接收据，能不能直接用个人邮箱申请？ # choice:email]
    -> T4K
+ [我想先确认主管手里会留下哪些记录。 # choice:records]
    -> T4I

=== T4I ===
-> invite_meng ->
我这里留出勤和交接接收记录，给你本人那一份可以。工作账号关了，记录不会一起删。 # speaker:meng
# file:D06
有记录，是不是就自动进结算了？ # player
我能核出勤，自动进不进表得问结算流程。我不能替那个页面点提交。 # speaker:meng
+ [那我核一下页面什么时候能用。 # choice:exit]
    -> T4H
+ [如果账号停了，我把个人邮箱申请发你，你能核出勤吗？ # choice:email]
    核事实我能做，但现行流程没给我代报入口，需要把流程一起改。 # speaker:meng
    -> T4K
+ [明白，我先留好这份工作安排。 # choice:later]
    -> desk

=== T4K ===
{has_amendment("A4"):
    -> T4S
}
现在只走工作账号，个人邮箱不能提交。收据你可以拿着，现行说明里它不代替申请。
+ [那按现行办法，我离场后本人到底能不能登录并提交？ # choice:promise]
    -> T4J
+ [先把完整指引给我，我想核时间。 # choice:file]
    -> T4H
+ [我先回去看，暂时不提出对照。 # choice:later]
    -> desk

=== T4J ===
{has_amendment("A4"):
    -> T4S
}
{has_proof("P4"):
    -> T4L
}
{not has_amendment("A3"):
    先按已经满足现行建单条件的人说。
}
账号会按规定停，但不影响你本人按流程申报。交接之后你自己登结算页提交，主管审核，就能进下一次应付表。
# proof:P4
-> END

=== T4L ===
这两个时间确实接不上。真到时候登不进，你发我，我找管理员看看。
+ [不重开工作账号也可以。把个人邮箱申报、主管核出勤、谁负责入表写进去。 # choice:email]
    -> T4M
+ [在最后一笔报酬结清之前，先别关我的工作账号。 # choice:account]
    -> T4N
+ [那先记你的这个答复，流程暂时不改。 # choice:later]
    好，有问题先联系我。
    -> desk

=== T4M ===
~ offeredA4 = true
可以增加个人邮箱入口。主管核本人出勤，人事收申请并登记回执，甲方负责把应付金额放进结算。
{mengJoined:
    出勤我能核。你不用为了工资留着工作账号。 # speaker:meng
}
还要写清账号关闭不影响结算，不能因为内部没人把表转过去，就把支付日期往后推。 # player
好。十号的约定不变，依法有更早支付要求的按要求办。只对有争议的部分核对，已核实的部分不一起扣着。
-> T4MOptions

=== T4MOptions ===
+ [正文、结算说明和离场指引一起改，我核对三份。 # choice:accept]
    -> applyA4
+ [如果主管请假了，就没人能核了吗？ # choice:alternate]
    人事登记之后负责转给代核人，不能要求你自己找一个在岗账号。这个也写进去。
    -> T4MOptions
+ [我先看看这个方案，暂时不确认。 # choice:later]
    -> desk

=== T4N ===
这个账号还连着公司的资料系统，离场就要停访问。可以给你一个不用工作账号的结算办法，不能为等结算一直保留工作权限。
+ [那把不用工作账号的办法写清楚。 # choice:email]
    -> T4M
+ [不接受替代入口。钱没全部结清，原工作账号就必须保留。 # choice:insist]
    保留原账号这项给不了，替代办法你又不接受，我们先停在这儿。
    # deadlock:L4
    -> END
+ [我想想，先不谈这条。 # choice:later]
    -> desk

=== T4S ===
现在离场账号仍然停，但人事登记我的个人邮箱申请，主管核本人出勤。没工作账号也能走下去？ # player
对。记录和回执都能留给你，不再靠重新开工作账号。公司内部转交不能把已核实报酬一直挂着。
{not has_amendment("A3"):
    申报入口有了，首周是否有资格结算仍要看另一段。 # thought
}
+ [我再确认未满七天那几天算不算。 # choice:days]
    {has_amendment("A3"):
        按实际提供劳动算，不再卡七天。
        -> desk
    }
    -> T4B
+ [打开现在的结算说明，我再看一次。 # choice:locate]
    # locate:D04
    -> desk
+ [这条清楚了。 # choice:later]
    -> desk

=== T5A ===
面试说从报到起参保。正文写不同阶段看选择单，具体是哪天开始？ # player
新人这边有一份保障方案，刚出来租房、通勤都有开销，我们给你预选了每月多拿四百的。
+ [四百先放一边。我报到后的第一个月，会有单位参保申报吗？ # choice:first]
    -> T5B
+ [选择单发我。我要看四百是额外福利，还是对应别的安排。 # choice:file]
    -> D07_T5C
+ [到手能多四百，那固定是不是就成八千了？ # choice:bonus]
    -> T5D

=== T5B ===
保障不会没有。前面按这份方案，后面进正式批次统一办。
+ [你说的前面「有保障」，是发四百，还是办理单位参保？ # choice:file]
    -> D07_T5C
+ [既然你说和之前谈的一样，面试说的参保起点没变吧？ # choice:promise]
    -> T5E
+ [我先看看正文和面试记录，再问。 # choice:later]
    -> desk

=== D07_T5C ===
# request:D07
-> T5C

=== T5C ===
{has_amendment("A2"):
    劳动合同已经改了，不过这张选择单还是按原先三个月的入组批次。要改办理方式，得把这张也一起确认。
- else:
    原来的实践阶段就是这个方案，正式录用后再申报。
}
拿到四百和留下参保记录不是同一件事。她说「统一办」，还得看有没有把前面那段补上。 # thought
+ [所谓统一办，是晚点办手续但补上报到起这段，还是只从后面开始？ # choice:promise]
    -> T5E
+ [我要参保，这四百和参保一起给吗？ # choice:bonus]
    -> T5D
+ [我再核一下她面试时怎么说。 # choice:later]
    -> desk

=== T5D ===
不是固定工资涨四百。这笔就是和阶段方案绑定的，改成单位参保，这四百会取消。个人应缴部分也要按实际列出来。
+ [明白。我仍然要确认报到起参保这一点有没有变。 # choice:promise]
    -> T5E
+ [固定七千六我认。先看选择单里的办理起点。 # choice:file]
    -> D07_T5C
+ [我还想要四百作为额外福利，这个能另外申请吗？ # choice:extra]
    目前这份岗位预算没有额外四百。参保是另一件事，不能拿这个问题抵掉。
    -> T5D

=== T5E ===
{has_proof("P5"):
    -> T5resume
}
和面试说的是同一套保障。只是按批次晚一点办，报到开始这段不会少；不是前几个月就留空了。
# proof:P5
-> END

=== T5F ===
这份确实写了不补前面三个月，和我面试那句对不上。我把这项按从实际用工起办理重报。
-> invite_zheng ->
这项可以改。四百绑定补助一起撤掉，固定七千六不动，单位和个人依法各自承担的部分分别列。 # speaker:zheng
~ offeredA5 = true
-> T5FOptions

=== T5resume ===
{offeredA5:
    -> T5FOptions
}
-> T5F

=== T5FOptions ===
+ [正文和选择单一起写，从实际用工起依法办理，删掉不补报和预选补助。 # choice:accept]
    -> applyA5
+ [我怎么核对公司后来有没有按这个起点办？ # choice:verify]
    -> T5G
+ [参保我想要，但我先不确认这份改法。 # choice:later]
    -> desk

=== T5G ===
需要你交的参保资料我单独列，登记后给你经办回执。可以提供的申报结果也会给本人，后面你可以按自己的参保记录核。系统出记录的时间不一定等于实际用工那天，起算和应缴那段不能靠晚办跳过去。
+ [把提供本人办理信息、差异找人事核对也写入选择单，按这个改。 # choice:accept]
    -> applyA5
+ [我要你保证报到当天就能在所有系统查到结果。 # choice:same-day]
    所有系统的显示时间我保证不了。我能写办理义务和核对办法。
    -> T5FOptions
+ [我先保留这个答复。 # choice:later]
    -> desk

=== T5R ===
取消的是绑定四百，固定工资仍然七千六。参保不会因为后面换批次而少掉实际用工开始的那段？ # player
对。按改过的正文和选择单办，原来三个月不申报、不补报的两句都删了。个人缴费会另列，不拿七千六固定项做文章。
-> desk

=== T6A ===
正文这条说离场后还有业务回避。是不能把公司资料带走，还是连下一份工作也有限制？ # player
主要是保护项目资料。大家都签这份，你正常做事、不把东西往外发，一般不会碰到。
+ [把完整附件给我，包括离职后的限制和违约金那几段。 # choice:file]
    -> D08_T6B
+ [假设我不带任何资料，只去另一家公司做公开内容，是否也要你们同意？ # choice:next-job]
    -> T6C
+ [我这个岗位到底能接触什么需要保密的内容？ # choice:access]
    -> D10_T6D

=== D08_T6B ===
# request:D08
-> T6B

=== D10_T6D ===
-> invite_meng ->
# request:D10
-> T6D

=== T6B ===
两年、名单、补偿通知都在这份里。模板按项目统一走，你要确认具体适用范围可以提。
资料要交还，和离开后去哪儿工作，是两件事。这张表把我填进了哪一种名单？ # thought
+ [名单说看接触的信息。我的岗位是根据哪一项列进去的？ # choice:promise]
    -> T6E
+ [所有公开内容岗位都要先找你们批准下一家公司吗？ # choice:next-job]
    -> T6C
+ [我先请孟乔确认实际权限，不能只看岗位名称。 # choice:access]
    -> D10_T6D

=== T6C ===
如果下一家公司业务相近，按现在这份就要报来审核，不是只看你有没有带文件。
+ [那这已经是在限制任职了。我这个岗位为什么适用？ # choice:promise]
    -> T6E
+ [这份原文给我，我把适用标准和实际岗位对一下。 # choice:file]
    -> D08_T6B
+ [我先不谈这一项。 # choice:later]
    -> desk

=== T6D ===
当前岗位只做公开资料，报价和后台数据都不会给你，相关会也不用你参加。我已经把这点写进权限确认。 # speaker:meng
保密附件是整批发的，我要让负责人看一下你这个岗位的适用。
+ [那就请确认，我到底符合名单里的哪项条件。 # choice:promise]
    -> T6E
+ [以后换了岗位、接触了新资料，也永远不可能有相关义务吧？ # choice:future]
    以后增加什么工作得具体说。现在这张表只确认这次给你的岗位。 # speaker:meng
    -> T6D
+ [权限确认我保存，回头再看附件。 # choice:later]
    -> desk

=== T6E ===
{has_proof("P6"):
    -> T6resume
}
-> invite_zheng ->
名单是按这份附件里的岗位标准列的，不是随便把你放进去。你现在这个岗位就在适用范围，和给你的权限安排对得上。 # speaker:zheng
# proof:P6
-> END

=== T6F ===
按现在给你的权限，确实没有报价和后台。但孟乔带你做熟了，你转头就去同类公司，我们又要从头带人。 # speaker:zheng
+ [带新人是你担心的事，可这份用的是接触保密信息的标准。请按实际岗位取消任职限制，资料保密我照做。 # choice:remove]
    -> T6G
+ [那把两年改成一年、十万减一半，就不再看岗位适不适用了？ # choice:less]
    -> T6H
+ [我还想把保密范围问清。公开稿件是不是也都算公司秘密？ # choice:secret]
    -> T6I

=== T6resume ===
{offeredA6:
    -> T6GOptions
}
-> T6F

=== T6G ===
~ offeredA6 = true
我可以取消这个岗位的离职竞业安排和对应违约金。账号、受保护信息的保密和交还义务保留。以后如果工作实际变了，再按那时的情况具体谈，不是今天把所有将来都签掉。 # speaker:zheng
把我从这份名单里去掉，正文也别继续引到一个要求任职审批的附件。 # player
可以。名单、任职审批、这项十万违约金一起撤。许然发完整新版本。 # speaker:zheng
-> T6GOptions

=== T6GOptions ===
+ [按这个改，我看正文和附件。 # choice:accept]
    -> applyA6
+ [我以后保存公开作品链接的事，能请孟乔再说一下？ # choice:portfolio]
    -> T6portfolio
+ [我想先读完现有文字，再确认。 # choice:later]
    -> desk

=== T6portfolio ===
-> invite_meng ->
你可以保存公开页面链接，描述自己负责了什么。客户稿不是都归我们一个人所有，文件拷出去、写谁署名，要另看授权。 # speaker:meng
-> T6GOptions

=== T6H ===
年限和金额可以谈，但只改这两个数，你还是在名单里，换工作仍要审核。 # speaker:zheng
他愿意把价码降下来，可我刚才问的是为什么会被限制。 # thought
+ [那还是回到适用条件，取消当前岗位这项限制。 # choice:remove]
    -> T6G
+ [我先保留这份，之后再决定。 # choice:later]
    -> desk
+ [这个安排我不接受，这次不签。 # choice:leave]
    -> leave_now

=== T6I ===
已经公开的内容，不会因为你在公司处理过就重新变成秘密。但账号不能借出去，别人的个人信息也不能带走。这些仍要保管。 # speaker:zheng
+ [这些保留。我要求删除的是本岗位的任职限制和对应违约金。 # choice:remove]
    -> T6G
+ [那公开作品的链接和工作原文件，也得分开看授权？ # choice:portfolio]
    是。公开能看到，不等于你拥有全部文件和署名，孟乔可以确认你负责哪部分。 # speaker:zheng
    -> T6I
+ [我再看看附件，暂时不确认。 # choice:later]
    -> desk

=== T6R ===
现在我不在这份离职竞业名单里，之后去同类公司不需要按这份附件找你们审批？ # player
对，就你现在这个岗位，相关限制已经撤了。公司的资料仍按权限和实际应承担的义务处理。 # speaker:zheng
+ [定位一下改过的附件，我保存。 # choice:locate]
    # locate:D08
    -> desk
+ [如果以后真换了接触其他资料的岗位，再具体确认？ # choice:future]
    是，不能用今天这份给将来的所有岗位自动套上限制。 # speaker:zheng
    -> desk
+ [明白，我继续看。 # choice:later]
    -> desk

=== T7A ===
常驻地点写的是这里。客户多了，会不会让我长期去外地驻场？ # player
这次岗位常驻本市。正文已经写了，长期变常驻地点要另外书面协商；本市临时外出会提前告诉你去哪儿、做什么。
+ [我不接受长期变地点，就不能拿这一条当成我提前同意了？ # choice:consent]
    对，这一条没有替以后所有调动预先签同意。
    -> desk
+ [工作电脑需要押金吗，坏了会直接从工资扣吗？ # choice:equipment]
    -> T7B
+ [能直接改成我自己决定每天在家还是来公司吗？ # choice:remote]
    -> T7C

=== T7B ===
不收押金。领用时记设备状态，交还时也记；有故障先查事实，不是电脑出问题就默认从你工资里划钱。
+ [交还的时候给我一份接收记录。 # choice:receipt]
    会给，离场指引也写了可发到个人邮箱。
    # file:D09
    -> desk
+ [那设备本身可以不还，反正没押金？ # choice:keep]
    没收押金不等于送给你，仍要按清单交还。
    -> T7A
+ [这条清楚了。 # choice:later]
    -> desk

=== T7C ===
-> invite_meng ->
这次招的是到岗岗位，复核和协作也按到岗排。偶尔有事可以单独商量，但我不能先给你一个每天自行决定的方案。 # speaker:meng
+ [明白，这次报价本来就是到岗。我继续看合同。 # choice:later]
    -> desk
+ [完全居家是我接受工作的条件，那这次就不签了。 # choice:leave]
    -> leave_now
+ [你现在必须答应每天由我选，否则不谈任何别的条款。 # choice:insist]
    这个条件我确实给不了。 # speaker:meng
    # deadlock:L7
    -> END

=== T8A ===
签前我想把正文提到的附件都看齐。目录里的现在能发吗？ # player
能。你要先看某一份，还是把签署包一起发过来？
+ [把还没发的签署附件一次给我，我看完再继续。 # choice:pack]
    -> T8B
+ [我先看离场交接和账户怎么处理。 # choice:exit]
    -> D09_T8C
+ [我想确认当前到底用哪些版本，已改的不能被旧附件盖回去。 # choice:versions]
    -> T8D

=== T8B ===
登记、结算、分工、保障、保密和离场指引都在这组。你慢慢看，已改过的我发现在这版，原版留在记录里。
# signing:request
文件齐了不等于每一句都看懂了。我可以从有疑问的条款再开口。 # thought
-> desk

=== D09_T8C ===
# request:D09
-> T8C

=== T8C ===
设备和资料交完，主管给接收记录，再回收账号。工资申请是结算说明的另一段。
+ [主管给的收据包含我自己的出勤日期吗？ # choice:receipt]
    包含本人部分，能发个人邮箱。
    -> desk
+ [结算说明也给我，我想看看销号之后怎么申请。 # choice:settlement]
    # request:D04
    {has_amendment("A4"):
        账号照常回收，结算改走个人邮箱。我得把这两份现行稿一起留好。 # thought
    - else:
        一个关账号，一个要登录。我得把两边的时间放一起看。 # thought
    }
    -> desk
+ [我先把交接流程保存。 # choice:later]
    -> desk

=== T8D ===
目录会列这次签的版本。新稿替换旧稿，旧句只留作修改记录。不是发过的文件全都同时算数。
+ [打开现在的签署包，我再核一下。 # choice:pack]
    -> T8versions
+ [核对完了，结束审阅。 # choice:review]
    # review
    -> T8DOptions
+ [我还有问题，回合同继续谈。 # choice:later]
    -> desk

=== T8DOptions ===
+ [打开现在的签署包，我再核一下。 # choice:pack]
    -> T8versions
+ [核对完了，结束审阅。 # choice:review]
    # review
    -> T8DOptions
+ [我还有问题，回合同继续谈。 # choice:later]
    -> desk

=== T8versions ===
# signing:review
-> T8DOptions

=== p1step1 ===
她说的是没收到内部拨款也会先付。分工单对这件事怎么写？ # thought
-> END

=== p1wrong ===
这段没有回答未拨款时商务会不会先付。我们先把付款前提对清楚。
-> wrong_thought

=== p1roles ===
不同公司分工和会不会按期付，是两件事。你这段只能说明谁做哪项，没说没收到拨款时会怎样。
-> wrong_thought

=== p1transfer ===
这段是钱怎么转过来，转一道不等于一定要晚发。你刚才问的是没收到钱时要不要先付。
-> wrong_thought

=== p1money ===
固定数和十号发我没有否认。你要对的是内部拨款会不会成为前提。
-> wrong_thought

=== p1right ===
你刚说商务会先付，不受内部拨款影响。可这张单写的是商务收到数字的款才划付，没收到不先付。同样是数字没拨款的情况，你说我能按期拿到，这里却让我跟着等。我需要把负责按期支付的公司写清楚，不能只留一个帮我协调的人。 # player
-> T1F

=== applyA1 ===
甲方和分工单都换了。商务仍能经办，但数字按期支付的责任不跟着转走。
# amend:A1
现在有一家写明要负责的公司了。其他条件要按这套文件分别核。 # thought
-> desk

=== p2step1 ===
合同到底把哪一段排在正式录用之前？ # thought
-> END

=== p2step2 ===
公司知道我是以什么身份、为了什么来的吗？ # thought
-> END

=== p2step3 ===
这段时间我实际上要做什么？ # thought
-> END

=== p2step4 ===
我可以发出已有的对照。要是用班次和岗位条款说明实际工作，我还得把缺的那段加上。 # thought
-> END

=== p2wrong ===
先把你的身份和这三个月实际承担的事情放在一起，不能只比较文件叫什么。
-> wrong_thought

=== p2status ===
毕业这点我没有否认。你还得对一下这段实践实际安排什么，不能只靠毕业日期说明工作怎么使用你。
-> wrong_thought

=== p2work ===
这能说明会接项目，但你引用的几句还没把你的登记和这三个月的身份安排对在一起。
-> wrong_thought

=== p2hours ===
有固定到场时间不等于已经说明了全部情况。具体做的是课程、练习还是正式任务，仍要看安排。
-> wrong_thought

=== p2right ===
这里把我写成三个月实践结束后再正式录用。可你们已经核过我毕业，也确认我是来找全职工作的；首周让我按班次到岗，任务交给孟乔审核，成果进正式发布。有人带我熟悉业务，不等于我没在工作。我可以接受在劳动合同里约定试用，但不接受先按正式工作的要求用三个月，手续却说还没开始。 # player
-> T2E

=== p2schedule ===
这里写的是先做三个月实践，期满才正式录用。你们也知道我已经毕业，是来找全职工作的。首周安排写的是报到就按内容组班次出勤、由主管分任务和审稿，合同里列的也是这个岗位的发布准备工作。可以在劳动合同里约定试用，但不能让我从第一天接这个岗位的活，却把正式手续留到三个月以后。 # player
-> T2E

=== p2interview ===
这里把我写成三个月实践结束后再正式录用。可你们已经核过我毕业，也确认我是来找全职工作的；孟乔在面试确认里说，入组就让我接每周资讯和尺寸适配，由她给任务、看稿、核出勤。有人带我熟悉业务，不等于我没在工作。我可以接受在劳动合同里约定试用，但不接受先按正式工作的要求用三个月，手续却说还没开始。 # player
-> T2E

=== applyA2 ===
从十二月一号起是一年劳动合同，前两个月算在里面，七千六不降。登记也改了。
# amend:A2
有人带我熟悉工作，和我从哪天算受聘，不再被写成两回事。 # thought
-> desk

=== p3step1 ===
她说只是晚点办。哪一句写的是以后也不再给这几天建单？ # thought
-> END

=== p3wrong ===
我说的是有报酬、按批次办。你这句还不能说明七天会把已经做的劳动排除掉。
-> wrong_thought

=== p3same ===
这句和我刚才说的一样，都是上过的班会结。它本身没证明结算说明在按相反条件处理。
-> wrong_thought

=== p3work ===
这能说明第一周干什么、记录会留下，但还没说明没满七天的钱是晚发还是不发。
-> wrong_thought

=== p3date ===
次月十号是发薪日，和首周是否有结算资格不是同一个条件。
-> wrong_thought

=== p3right ===
这段不是说等下一批发。它写的是没满七天离场，这几天只进适应记录，不进应付，也不再补建。按我做了五天又正常离场的情况，你刚说那五天都有报酬，单子却把它们排除了。请按实际提供劳动核算，把七天这个资格门槛删掉。 # player
-> T4F

=== applyA3 ===
不满七天不计付的那段取消了。你实际做过的班按出勤核，不能只留作适应记录。
# amend:A3
五天也要算。这笔钱后来怎么进结算，还写在后面。 # thought
-> desk

=== p4step1 ===
我能用来登录结算页的账号，会在什么时候停？ # thought
-> END

=== p4step2 ===
到那时，我的结算申请已经能提交了吗？ # thought
-> END

=== p4wrong ===
你这几句还没把账号停用和申请开放的先后关系说清楚。
-> wrong_thought

=== p4time ===
离场停账号本身是正常操作。你要说明的是停的时候，申请是否已经能办。
-> wrong_thought

=== p4receipt ===
收据能发个人邮箱，不等于个人邮箱能提交结算申请。这两段并没有说是同一个入口。
-> wrong_thought

=== p4gate ===
我们这句先说已经符合建单条件的人。七天那项可以另外谈，它不是账号能不能登录的证据。
-> wrong_thought

=== p4right ===
离场那天六点，工作账号就停了，结算页用的也是这个权限。可申请要等交接后的下一个工作日才开放，还不准提前报。不是我忘了点，是按你们自己的时间走，我能登录的时候不能申报，能申报的时候已经不能登录了。请给一个不用工作账号也能办理的入口，并写清谁收、谁核、谁把已经应付的钱结出来。 # player
-> T4L

=== applyA4 ===
三份都改了。关账号和结算分开，个人邮箱有受理回执，人事负责转到能核的人那里。
# amend:A4
现在不是等谁临时帮忙开账号，文件里已经有离场后能走的办法。 # thought
-> desk

=== p5step1 ===
面试承诺从哪一天开始参保？要是选择单已经能反驳她刚才的承诺，也可以先圈出那一句。 # thought
-> END

=== p5step2 ===
这张选择单有没有把同一段时间保留下来？如果刚才已经圈了选择单，我现在就能回应她。 # thought
-> END

=== p5wrong ===
这些句子还没说明哪一段参保是晚办理，哪一段根本没有安排。
-> wrong_thought

=== p5bonus ===
有补助这一项，本身还不能证明哪段时间有没有申报。起点和是否补报得看办理那一段。
-> wrong_thought

=== p5money ===
四百写的是固定报酬之外，七千六没有变。你现在问的是参保有没有少一段。
-> wrong_thought

=== p5term ===
劳动合同和试用期改过了，不代表这张选择单的办理起点自动变了。要核就核本单具体怎么写。
-> wrong_thought

=== p5right ===
面试记录说报到起参保，这张选择单却写前三个月不申报，正式录用后只从那天开始，也不补前面三个月。这不是同一个起点晚点办手续，是直接少掉一段。四百补助不等于那段参保记录。请把从实际用工起依法办理写进正文，取消这份延后和不补报安排。 # player
{has_amendment("A2"):
    劳动合同已经改了，这张旧选择单也得一起清掉，不能让两份继续说不同的起点。 # player
}
-> T5F

=== p5spoken ===
你刚说报到开始这段不会少，但选择单明确写前三个月不申报，也不补报。它不是晚一点办理同一段保障，而是把前面三个月留空。请删掉这个安排，把实际用工起的参保义务写清。 # player
{has_amendment("A2"):
    劳动合同已经改了，这张旧选择单也得一起清掉，不能让两份继续说不同的起点。 # player
}
-> T5F

=== applyA5 ===
三个月留空的安排已经删了，固定七千六保留，四百替代补助取消。本人办理信息由人事提供。
# amend:A5
少拿一项绑定补助，和把该有的参保起点写回来，是这次实际谈下的变化。 # thought
-> desk

=== p6step1 ===
他拿什么条件决定谁要回避同类业务？ # thought
-> END

=== p6step2 ===
我这次接的岗位，实际准备让我接触什么？ # thought
-> END

=== p6step3 ===
他已经说我在名单里。我可以直接回应，也可以再引用把我列进去的那一段。 # thought
-> END

=== p6wrong ===
这几段还没把名单标准、你的当前岗位和实际限制对应起来。 # speaker:zheng
-> wrong_thought

=== p6role ===
岗位名称和工资多少不能说明能接触什么。我们说的是实际工作内容和资料范围。 # speaker:zheng
-> wrong_thought

=== p6fine ===
你可以谈金额，但这还没说明你为什么不在适用范围。现在核的是名单依据。 # speaker:zheng
-> wrong_thought

=== p6secret ===
不接触那些经营信息，和仍然要保护账号、个人信息并不冲突。你这两段说的是一般信息保护，还没对上我们在谈的任职名单。 # speaker:zheng
-> wrong_thought

=== p6defer ===
-> defer_words ->
好，你核完再说。 # speaker:zheng
-> END

=== p6right ===
附件先说看是否接触未公开报价、投放和经营数据，还把普通公开内容整理岗位排在名单外。孟乔给我的安排正是只做公开内容，不开这些资料权限，也不让我旁听或转发。可后面又把我这批人统一列进名单，连去同类公司做什么岗位都不区分。你说名单和实际权限对得上，这三处对不上。具体该保密的资料我会保护，但不能拿当前并没有的接触范围，先替我决定下一份工作能去哪。 # player
-> T6F

=== p6spoken ===
附件说普通公开内容整理岗位不在名单里。孟乔给的权限确认写明我做的就是公开资料，也不接触那些报价和后台数据。可你刚才说我已经在名单里。这个岗位条件和你说的对不上。该保密的资料我会保护，请把对下一份工作的限制撤掉。 # player
-> T6F

=== applyA6 ===
当前岗位已经从名单移出，任职审批和十万那项也一并删了。信息保护保留的是另一段。
# amend:A6
下份工作去哪儿，不再被这一张统一名单提前圈住。该保管的资料仍然得保管。 # thought
-> desk

=== p6card ===
这是你的校园卡。我不怀疑你上过学，但它说明不了刚才那条安排有什么矛盾。 # speaker:zheng
照片再清楚，也不是这件事的证据。 # thought
-> END


=== proof_defer ===
-> defer_words ->
好，你核完再说。
-> END

=== defer_words ===
现在拿出的几句还对不上。我先把这句话留着，回头再看材料。 # thought
这句我先记下来，等我把手里的原文核完再接着问。 # player
->->

=== wrong_thought ===
我引用的这几段还不能证明刚才那个问题。得把条件对齐。 # thought
-> END

=== invite_meng ===
{not mengJoined:
    ~ mengJoined = true
    具体工作我让孟乔说，她是以后直接带你的人。
    我在。你面试那份资料整理我看过了。你想确认第一周做什么，还是我们怎么交稿？ # speaker:meng
}
->->

=== invite_zheng ===
{not zhengJoined:
    ~ zhengJoined = true
    这项我不能自己改。我把负责这边用人安排的郑衡拉进来，刚才那几句也发给他了。
    看到了。你想改的是哪一个实际安排，我们就谈哪一个。岗位和七千六的预算已经定了。 # speaker:zheng
}
->->

=== function has_file(id) ===
~ return false

=== function has_amendment(id) ===
~ return false

=== function has_proof(id) ===
~ return false

=== function in_game() ===
~ return false
