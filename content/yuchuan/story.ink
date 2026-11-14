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
七千六这个数倒没错。不过跟谁签、头三个月算什么，不能就这么带过去。 # thought
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
这条先聊到这儿，我再把文件看一遍。 # player
-> desk

=== stale ===
这句已经改掉了。旧稿留着是给你对照的，要说现在的问题，得看下面那版。
对，旧句只能证明它以前怎么写。我再看看现在这行。 # thought
-> END

=== refused ===
今天先谈到这儿吧。有几件事一直谈不拢，签署我先停一下，你也可以去看看别的机会。
她不想再绕了。要么把刚才那件事说清楚，要么就到这儿。 # thought
-> END

=== resume ===
行，就接着刚才那件事说。文件和改过的稿子都在，你按最新版看。
-> END

=== refused_leave ===
好，这次就不继续了。 # player
行，材料你留着。签署这边我关掉。
有几个地方我还是没底。这次先不签，总比糊里糊涂答应强。 # thought
-> END

=== finish_leave ===
这份我先不签。聊清楚的内容我会留好，今天到这儿吧。 # player
好，我把流程关掉，报到也不安排了。
{mengJoined:
    知道了，这周的任务我另外排人。 # speaker:meng
}
工作没谈成，心里还是有点空落落的。但至少，我没把那些没看懂的字签下去。 # thought
-> END

=== finish_sign ===
我按现在这版签。正文、附件，我都要留一份。 # player
好，我把整套签署文件发你。你都存好，报到那天直接联系我。
# signing:send
{
- has_amendment("A1") && has_amendment("A2") && has_amendment("A3") && has_amendment("A4") && has_amendment("A5") && has_amendment("A6"):
    {mengJoined:
        那我给你排第一周的任务。先做两份给我看看，别一个人闷头改一天。 # speaker:meng
    }
    活不会少，孟乔也肯定会盯稿。好在谁管我、从哪天算、走的时候怎么结，这回都写明白了。 # thought
- has_amendment("A1") || has_amendment("A2") || has_amendment("A3") || has_amendment("A4") || has_amendment("A5") || has_amendment("A6"):
    谈下来的几处都落进文件了。剩下的条件我也认，那就把最后这套存好。 # thought
- else:
    最后还是按原版签。附件也得留全，不能只截个写着七千六的页面。 # thought
}
-> END

=== topic1 ===
{has_amendment("A1"):
    -> T1R
}
{has_proof("P1"):
    刚才说的那个改法，我们接着谈。 # player
    -> T1resume
}
-> T1A

=== topic2 ===
{has_amendment("A2"):
    -> T2R
}
{has_proof("P2"):
    刚才说的那个改法，我们接着谈。 # player
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
刚才说的结算改法，我想再对一遍。 # player
+ {has_proof("P3") && not has_amendment("A3")} [确认一下：没做满七天，也按实际天数结。 # choice:confirm-days]
    {offeredA3: -> T4FOptions}
    -> T4F
+ {has_proof("P4") && not has_amendment("A4")} [确认一下：离场以后，怎么申请最后一笔工资。 # choice:confirm-exit]
    {offeredA4: -> T4MOptions}
    -> T4L
+ [我想再看一遍材料，先谈另一处。 # choice:check-other]
    -> pay_review

=== pay_review ===
你想问头七天怎么算，还是走了以后怎么申请？
+ {not has_amendment("A3")} [我想再问问第一周的工资怎么算。 # choice:days]
    {has_proof("P3"): -> T4F}
    -> T4C
+ {not has_amendment("A4")} [我想弄清离场后怎么申请工资。 # choice:exit]
    {has_proof("P4"): -> T4L}
    -> T4H
+ [这两件事我先记下了。 # choice:later]
    -> desk

=== topic5 ===
{has_amendment("A5"):
    -> T5R
}
{has_proof("P5"):
    刚才说的那个改法，我们接着谈。 # player
    -> T5resume
}
-> T5A

=== topic6 ===
{has_amendment("A6"):
    -> T6R
}
{has_proof("P6"):
    刚才说的那个改法，我们接着谈。 # player
    -> T6resume
}
-> T6A

=== topic7 ===
-> T7A

=== topic8 ===
-> T8A

=== T1A ===
面试、办公地址都是与川数字，签约却是商务咨询。两边分别负责什么？ # player
都是一家体系里的，你不用想得太复杂。干活在数字这边，签合同、发工资走商务。你坐哪儿、做什么都不变。
+ [我问的不是工位。如果十号钱没到，我找谁，哪家公司必须给我付？ # choice:pay]
    -> T1B
+ [先给我看一下正文提的分工单。我想知道哪边签、哪边拨款。 # choice:file]
    -> D05_T1C
+ [那我请假、交稿、核出勤，都是找数字这边的主管？ # choice:management]
    -> T1D

=== T1B ===
真有问题你找我，我去问结算组，哪能让你自己跑两家公司。
+ [找你是联系办法。我想问的是：数字那边还没拨款，商务也要按十号先付吗？ # choice:promise]
    -> T1E
+ [这张分工单能发我吗？我把付款那一段看完再问。 # choice:file]
    -> D05_T1C
+ [那你在群里说一句你负责，我就不看公司这一栏了。 # choice:personal]
    你随时能找我，但工资又不是从我个人卡里出。两家公司怎么结，还是得看文件。
    -> T1B

=== D05_T1C ===
# request:D05
-> T1C

=== T1C ===
谁签约、谁管考勤、钱怎么拨，上面都写了。以后有事照着找，省得你到处问。
找谁倒是写清楚了。可数字不拨款时，商务肯不肯先垫，还是没说。 # thought
+ [数字晚拨一天，商务是先按期付，还是我跟着等？ # choice:promise]
    -> T1E
+ [我还想确认实际管我的人。 # choice:management]
    -> T1D
+ [我先把正文和这张单放一起看。 # choice:later]
    -> desk

=== T1D ===
-> invite_meng ->
请假、交稿、算出勤，都找我。你在数字内容组干活，商务那边不会来给你派活。 # speaker:meng
项目换了，还是这个内容组的岗位？ # player
对，这个项目做完还有别的，不是客户一走你就没岗位了。后面日常做什么，首周安排里也写了。 # speaker:meng
# file:D06
+ [管理这边清楚了。发钱那边如果没收到拨款，还要按期付给我吗？ # choice:promise]
    -> T1E
+ [这份安排我留着。我回合同看一下入职阶段。 # choice:later]
    -> desk
+ [孟乔能直接替公司答应工资一定到账吗？ # choice:personal]
    你哪天来、做了什么，我能确认。拨款不归我管，工资能不能按时到，得公司给你准话。 # speaker:meng
    -> T1C

=== T1E ===
{has_proof("P1"):
    -> T1resume
}
既然商务跟你签，就会按日子先把钱给你。数字什么时候拨款是内部的事，不会拖到你头上。
# proof:P1
-> END

=== T1F ===
-> invite_zheng ->
单子只是把两边的账分开。真有钱没拨过来，我去协调，不会叫你自己催。 # speaker:zheng
+ [那就写明不等内部拨款。数字实际安排工作，能不能由数字签，也由数字按期付？ # choice:direct]
    -> T1G
+ [你都在群里保证十号发了，那我先信你这句话。 # choice:informal]
    -> T1H
+ [那就让数字和商务都在付款承诺上签字，出了事谁都别推。 # choice:joint]
    -> T1I

=== T1resume ===
{offeredA1:
    -> T1GOptions
}
-> T1F

=== T1G ===
~ offeredA1 = true
这个岗位可以改由数字签，商务只帮忙办手续。预算本来就在内容组，换签约方我能批，但整套文件里的公司名都得换。 # speaker:zheng
那就写明商务只办手续。以后款有没有拨过去，都不能成为数字不给我发工资的理由。 # player
可以。数字管人，也按期付钱；谁代办都不影响这个责任。许然，按这个改。 # speaker:zheng
-> T1GOptions

=== T1GOptions ===
+ [就这么改。正文和分工单我都要看。 # choice:accept]
    -> applyA1
+ [变成数字签，七千六或报到日期会动吗？ # choice:budget]
    都不动。这回只改谁负责。 # speaker:zheng
    -> T1GOptions
+ [我先不确认，想把其他安排也看一下。 # choice:later]
    -> desk

=== T1H ===
有问题你来找我，我负责处理。文件先用这套，别因为内部流程耽误报到。 # speaker:zheng
他会帮忙处理，我信。可单子上那条要是不改，将来还是照它办。 # thought
+ [我要的是公司不等拨款也按时发，不是出了事再找你。这条还是得改。 # choice:write]
    -> T1G
+ [这次先保留原文，我继续看。 # choice:later]
    -> desk
+ [那就写成由你个人承担所有工资。 # choice:personal]
    工资是公司发，写成我个人欠你可不行。 # speaker:zheng
    -> T1F

=== T1I ===
数字直接签、按时付，我可以答应；商务只办手续。但再要两家公司一起担保，这个我批不了。 # speaker:zheng
两家都签当然更踏实。现在他肯让数字负责，这个方案已经比原来清楚了，就看我接不接受。 # thought
+ [好，那就写明数字不等内部拨款，按期给我付。 # choice:direct]
    -> T1G
+ [只签一家我不接受，你继续去批两家共同承担，别给我其他方案。 # choice:insist]
    两家共同承担，我这次确实批不了。只能先卡在这儿了。 # speaker:zheng
    # deadlock:L1
    -> END
+ [这个安排我仍然不接受，我不签了。 # choice:leave]
    -> leave_now

=== T1R ===
现在甲方换成数字了。以后商务还发通知、代转工资，我照样找你就行？ # player
对，有事还是找我。谁发通知是小事，该数字担的责任不会因此变回去。
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
刚毕业都得有个适应期嘛。工资一分不少，你先跟着组里做，等顺手了，我们再办正式手续。
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
毕业没给你录错。「实践人员」只是这批新人的分组，不是把你当在校生。
她明知道我毕业了，是来上班的。接下来就看，这三个月到底让我干什么。 # thought
+ [那请孟乔说清楚第一周的任务是不是正式交付。 # choice:work]
    -> D06_T2C
+ [已经不是学校实习，为什么不从报到就按劳动合同走？ # choice:probation]
    -> T2D
+ [登记表先留着，我核对一下已有的面试记录。 # choice:later]
    -> desk

=== T2C ===
第一天开账号，我讲半小时规矩，然后就直接做资讯和尺寸适配。你做的稿我看完是要发的，不是练手用的废稿。 # speaker:meng
如果第一周没做完，就得我继续改到能交？ # player
对，哪里不行我会说，也会带你改。但活是你的，不是坐在旁边看我做。 # speaker:meng
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
试用可以，但考核得看我实际做了什么。别到最后才拿出一套我没见过的标准。 # player
可以，就按发你的任务和书面要求来。不能一句「实践结束了」就让你走。 # speaker:zheng
-> T2FOptions

=== T2FOptions ===
+ [就这么改。正文、登记类别一起换，前面谈好的别动。 # choice:accept]
    -> applyA2
+ [劳动合同的甲方是哪一家？ # choice:entity]
    {has_amendment("A1"):
        数字公司。
    - else:
        目前还是商务。这次先改入职身份，跟谁签可以接着谈。
    }
    -> T2FOptions
+ [我先考虑一下这个试用安排。 # choice:later]
    -> desk

=== T2G ===
只换标题没用。里面还是先做三个月、期满才录用，那不是换汤不换药吗？
我要改的是自己从哪天开始算什么身份，不是封面上那几个字。 # thought
+ [那还是按一年合同、两个月试用具体改。 # choice:employment]
    -> T2F
+ [暂时不改，我把其他条款看完。 # choice:later]
    -> desk
+ [我不接受现有方案，这份先不签。 # choice:leave]
    -> leave_now

=== T2H ===
一份小样看不出你能不能持续接活。两个月试用得留，工资不打折；完全取消，我不批。 # speaker:zheng
+ [那把试用期、工资和怎么考核都写清楚。 # choice:employment]
    -> T2F
+ [我只接受免试用，你现在就按这个批，其他改法不用再说。 # choice:insist]
    那这件事我们现在谈不拢。 # speaker:zheng
    # deadlock:L2
    -> END
+ [我不接受这份岗位安排，先不签。 # choice:leave]
    -> leave_now

=== T2R ===
十二月一号就开始算合同，两个月试用也包含在一年里面，对吗？ # player
对，前面不再塞三个月实践。固定工资还是七千六。
{not has_amendment("A5"):
    保障选择单还是单独一份。参保怎么起算，你得再看那张。
}
合同身份改过来了。其他附件还得一张张看，不能默认它们也跟着改了。 # thought
-> desk

=== T3A ===
岗位这条能具体一点吗？我第一周要做什么，哪些材料能看？ # player
-> invite_meng ->
先做资讯整理和尺寸适配。发出前我把关，但你得自己动手，不是来看我做。 # speaker:meng
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
当天做不完，我就得自己留下来补吗？ # player
做不完先告诉我卡在哪儿，我会调任务。真要加时间，我在群里写清楚、记好，不会一句「工资里包含了」就算完。 # speaker:meng
+ [这份安排我保存。我再去核入职阶段的写法。 # choice:later]
    -> desk
+ [我想知道做这些稿到底开放哪些资料。 # choice:access]
    -> D10_T3C
+ [这些任务都由你来核，出勤也是你确认？ # choice:attendance]
    对。交稿和出勤是两本账：来了不代表稿子一定行，稿子要改也不代表这天没来。 # speaker:meng
    -> T3A

=== T3C ===
你只用网上已经公开的资料。报价、后台、没公开的计划，这个岗位都不开权限，也别借别人账号看。 # speaker:meng
+ [不开权限之外，会不会让我旁听会议或者帮忙转这些文件？ # choice:meetings]
    现在没有这种安排。以后真要加，我会先跟你说清楚加什么。 # speaker:meng
    -> T3A
+ [那我做过的公开稿件，离开以后能放进作品集吗？ # choice:portfolio]
    -> T3E
+ [这张权限确认我留着。 # choice:later]
    -> desk

=== T3D ===
九点半到六点半，中午休一小时，不值班。实际干活就是八小时。 # speaker:meng
九点半到六点半是九小时，扣掉一小时午休，正好八小时。这里没多算，午休真要干活才得另算。 # thought
+ [如果临时安排午休工作，还是要另记实际时间？ # choice:break]
    对。总不能让你干活，还说你在午休。 # speaker:meng
    -> desk
+ [那我继续看实际任务。 # choice:schedule]
    -> D06_T3B
+ [只要起止隔了九小时，就必须把一小时午休也算加班。 # choice:overtime]
    午休真干活当然要算。现在写的是完整休一小时，不能看到上下班时间就多算一小时。 # speaker:meng
    -> T3A

=== T3E ===
公开页面链接可以留，也可以写清楚自己负责哪部分。但客户原文件别直接拷走，署名也得看客户授权。 # speaker:meng
+ [那我不会把整个客户项目说成我一个人做的，先留公开链接。 # choice:public]
    这样就行。以后要证明哪部分是你做的，来找我确认。 # speaker:meng
    -> desk
+ [能把所有客户原文件都默认授权我带走吗？ # choice:source]
    这个我不能替客户答应。我只能确认你做过哪部分。 # speaker:meng
    -> T3C
+ [我先看离职附件是不是也按这个范围写的。 # choice:later]
    -> desk

=== T4A ===
固定七千六这项对得上。我想问首次入组和离场的结算，正文为什么单独指到另一份说明？ # player
新人总得适应几天，系统也是一批一批录的。放心，不是非得做满一个月才有钱。
+ [假设我正常做了五天，之后依法办好离场，这五天怎么算？ # choice:days]
    -> T4B
+ [把结算说明发我，我看一下「建记录」到底指哪一步。 # choice:file]
    -> D04_T4C
+ [离场账号会收回吧？那我用什么报最后一次结算？ # choice:exit]
    -> T4H

=== T4B ===
还没来就想着走啦？是哪里不放心吗？头几天有人带，我还是希望你先把这一周做下来。
+ [正因为想来，我才得先问明白。就当我实实在在干了五天，这五天怎么算？ # choice:promise]
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
头几天主要看你适不适应。结算组也不想今天来一个人、明天走一个人，就单独开一张单。
他们想少开几张单，我理解。可我上过的班会不会白干，这得问清楚。 # thought
+ [所以没满七天只是晚点发，还是这几天根本不给？ # choice:promise]
    -> T4D
+ [第一周实际交付的内容，我想请主管确认。 # choice:work]
    -> D06_T4E
+ [我先问另一种情况：已经够结算条件，但离场后账号关了，怎么申请？ # choice:exit]
    -> T4H

=== T4D ===
{has_amendment("A3"):
    -> T4R
}
{has_proof("P3"):
    -> T4F
}
只要你真干了，那几天的钱都有。七天只是攒一批一起办，不是没做满就不给钱。
# proof:P3
-> END

=== T4E ===
第一周就有正式活，安排可以给你看。有人带不等于你的稿没人用。 # speaker:meng
不过丑话说前面，真要走，手头的东西得交接好。你做了一半的稿放哪儿，总不能让我猜。 # speaker:meng
+ [交接我肯定办。那这五天的钱，不会因为我没干满七天就没了吧？ # choice:promise]
    -> T4D
+ [你会给我自己的出勤和交接记录吗？ # choice:records]
    你的那份可以给你。出勤和交接记录在我这儿，账号删了，记录也不会跟着没。 # speaker:meng
    # file:D06
    -> T4C
+ [我先把这个工作安排和结算说明放一起看。 # choice:file]
    # file:D04
    -> desk

=== T4F ===
~ offeredA3 = true
我看明白了，这不是晚发，是没满七天就干脆不算。估计就是怕人干两天跑了，带教也白忙。
该交接的我一件不少，但干过的五天不能当没干。你们要核的是我来了几天，不是这几天的工资值不值得给。 # player
我把这两段给结算组看了，他们同意删掉七天这条，从上班第一天起算。出勤还是孟乔核，工资标准不变。
-> T4FOptions

=== T4FOptions ===
+ [改正文和结算说明，我看过新稿再继续。 # choice:accept]
    -> applyA3
+ [要是交接没做完，你们会不会又把前几天的工资一笔抹掉？ # choice:handover]
    不会。交接出了问题另说，不能拿这条把干过的活一笔勾掉。
    -> T4FOptions
+ [这个改法先留着，我想把怎么申请也问清楚。 # choice:later]
    -> desk

=== T4R ===
现在干一天算一天了。那最后一笔钱，要怎么申请？ # player
后面写了：交接完去结算页提交，主管审完就进付款表。
该给的钱终于认下了。可人走了以后还登不登得上这个页面，又是个问题。 # thought
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
账号是技术那边收，工资是结算这边办，不是一拨人。我把离场指引发你，时间都写着。
{has_file("D09") && has_file("D04"):
    # locate:D09
- else:
    # file:D09
    # file:D04
}
+ [我照流程交接完，再自己登结算页，就能正常申请，不会卡住？ # choice:promise]
    -> T4J
+ [有交接收据，能不能直接用个人邮箱申请？ # choice:email]
    -> T4K
+ [我想先确认主管手里会留下哪些记录。 # choice:records]
    -> T4I

=== T4I ===
-> invite_meng ->
出勤和交接记录我这儿都留，你的那份可以给你。账号关了，记录又不会跟着消失。 # speaker:meng
# file:D06
有记录，是不是就自动进结算了？ # player
出勤我能核，会不会自动进工资表你得问结算。那个提交按钮又不是我这儿点的。 # speaker:meng
+ [那我核一下页面什么时候能用。 # choice:exit]
    -> T4H
+ [如果账号停了，我把个人邮箱申请发你，你能核出勤吗？ # choice:email]
    你上了几天班，我能证明。但现在没给我代报的权限，要这么办就得改流程。 # speaker:meng
    -> T4K
+ [明白，我先留好这份工作安排。 # choice:later]
    -> desk

=== T4K ===
{has_amendment("A4"):
    -> T4S
}
现在只认工作账号，个人邮箱提交不了。收据可以留，但它不能代替结算申请。
+ [那按现在这个流程，我离场后到底还能不能登录、提交？ # choice:promise]
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
    先说已经够结算条件的人。
}
账号到时间会停，但不耽误你申请。交接完自己上结算页提交，主管一审，就进下一批工资表。
# proof:P4
-> END

=== T4L ===
这两个时间确实没接上。真登不进去你就找我，我让管理员看看。
+ [不用重开工作账号也行。写明可以用个人邮箱申请、主管核出勤，再写清谁负责把工资录进去。 # choice:email]
    -> T4M
+ [那就等最后一笔工资结清，再关我的工作账号。 # choice:account]
    -> T4N
+ [那你这句话我先留着，流程暂时不改。 # choice:later]
    行，真有问题先来找我。
    -> desk

=== T4M ===
~ offeredA4 = true
可以加个人邮箱。主管核出勤，人事收申请、给回执，甲方把该付的钱录进结算。
{mengJoined:
    出勤我来核。你不用为了拿工资，一直留着工作账号。 # speaker:meng
}
还得写明，账号关了不影响结算。你们内部没人转表，也不能把付款日子往后拖。 # player
好，还是十号发，依法该更早的就按更早的来。有争议的部分单独核，没争议的钱别一起压着。
-> T4MOptions

=== T4MOptions ===
+ [正文、结算说明、离场指引一起改，三份我都要看。 # choice:accept]
    -> applyA4
+ [如果主管请假了，就没人能核了吗？ # choice:alternate]
    人事收到后转给代核的人，不会让你满公司找谁还在上班。这条也写上。
    -> T4MOptions
+ [我先看看这个方案，暂时不确认。 # choice:later]
    -> desk

=== T4N ===
这个账号还连着资料库，人一走就得关。可以换个不要工作账号的结算办法，但不能为了等工资一直开着权限。
+ [那把不用工作账号的办法写清楚。 # choice:email]
    -> T4M
+ [不接受替代入口。钱没全部结清，原工作账号就必须保留。 # choice:insist]
    原账号不能留，别的办法你也不要，那只能先停在这儿。
    # deadlock:L4
    -> END
+ [我想想，先不谈这条。 # choice:later]
    -> desk

=== T4S ===
现在离场账号仍然停，但人事登记我的个人邮箱申请，主管核本人出勤。没工作账号也能走下去？ # player
对，记录和回执都给你，不用重开账号。内部谁转给谁，也不能把核好的工资一直挂着。
{not has_amendment("A3"):
    申请入口解决了。可头七天到底算不算钱，还是得看前面那条。 # thought
}
+ [我再确认未满七天那几天算不算。 # choice:days]
    {has_amendment("A3"):
        干几天算几天，不再卡七天。
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
新人有份保障方案。你刚工作，租房、坐车都要钱，所以我们先给你选了每月多拿四百这个。
+ [四百先放一边。我报到后的第一个月，公司会给我交社保吗？ # choice:first]
    -> T5B
+ [选择单发我。我要看四百是额外福利，还是对应别的安排。 # choice:file]
    -> D07_T5C
+ [到手能多四百，那固定是不是就成八千了？ # choice:bonus]
    -> T5D

=== T5B ===
保障肯定有。前面先按这个方案，后面再跟着正式员工统一办。
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
    劳动合同是改了，可这张单还按原来那三个月走。要改参保时间，这张也得一起改。
- else:
    原来那三个月实践就走这个方案，等正式录用再申报。
}
多拿四百，跟社保有没有交上，是两回事。她说的「统一办」，到底补不补前面三个月？ # thought
+ [所谓统一办，是晚点办手续但补上报到起这段，还是只从后面开始？ # choice:promise]
    -> T5E
+ [我要参保，这四百和参保一起给吗？ # choice:bonus]
    -> T5D
+ [我再核一下她面试时怎么说。 # choice:later]
    -> desk

=== T5D ===
不是工资涨四百，这是这个阶段方案里的补助。改回单位参保，这四百就取消，你自己该交的部分也会列出来。
+ [明白。我仍然要确认报到起参保这一点有没有变。 # choice:promise]
    -> T5E
+ [固定七千六我认。先看看选择单从哪天开始交。 # choice:file]
    -> D07_T5C
+ [我还想要四百作为额外福利，这个能另外申请吗？ # choice:extra]
    目前这份岗位预算没有额外四百。参保是另一件事，不能拿这个问题抵掉。
    -> T5D

=== T5E ===
{has_proof("P5"):
    -> T5resume
}
跟面试说的是一回事，只是跟着批次晚点办。报到以后那段不会少，不会给你空几个月。
# proof:P5
-> END

=== T5F ===
对，这张写了前三个月不补，跟面试说的不一样。我按实际上班起参保重新报。
-> invite_zheng ->
这项能改。四百补助取消，固定七千六不动，公司和个人各交多少分别写。 # speaker:zheng
~ offeredA5 = true
-> T5FOptions

=== T5resume ===
{offeredA5:
    -> T5FOptions
}
-> T5F

=== T5FOptions ===
+ [正文和选择单一起改：从上班起依法参保，删掉不补报和那四百的预选补助。 # choice:accept]
    -> applyA5
+ [我怎么核对公司后来有没有按这个起点办？ # choice:verify]
    -> T5G
+ [参保我想要，但我先不确认这份改法。 # choice:later]
    -> desk

=== T5G ===
要交什么资料，我单独列给你；办完给回执，能查到的申报结果也发你。系统晚点显示正常，但该从哪天算、哪几个月该交，不能就这么跳过去。
+ [把办理信息给我、对不上找人事核对也写进去，就按这个改。 # choice:accept]
    -> applyA5
+ [我要你保证报到当天就能在所有系统查到结果。 # choice:same-day]
    每个系统哪天显示，我保证不了。能保证的是该办就办、能查到、对不上有人核。
    -> T5FOptions
+ [我先保留这个答复。 # choice:later]
    -> desk

=== T5R ===
取消的是那四百补助，固定工资还是七千六。社保不会因为后面换批次，就漏掉我刚入职那几个月吧？ # player
对，按新文件办。三个月不交、不补那两句都删了。个人缴费单列，固定七千六不动。
-> desk

=== T6A ===
正文这条说离场后还有业务回避。是不能把公司资料带走，还是连下一份工作也有限制？ # player
主要是怕项目资料外流。大家都签，你好好做事、不往外发东西，一般也没什么事。
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
两年、名单、补偿都在这份里。项目统一用这套模板，你觉得哪条不该套在你身上，可以说。
归还资料是一回事，走了以后去哪儿上班是另一回事。我得看看，它凭什么把我也列进去。 # thought
+ [名单不是按接触什么资料来划吗？我这个岗位到底中了哪一条？ # choice:promise]
    -> T6E
+ [所有公开内容岗位都要先找你们批准下一家公司吗？ # choice:next-job]
    -> T6C
+ [我先请孟乔确认实际权限，不能只看岗位名称。 # choice:access]
    -> D10_T6D

=== T6C ===
下家要是做相近业务，按这份就得先报给我们审，不是你不带文件就没事。
+ [那不就是管我去哪儿上班吗？凭什么我这个岗位也要受限？ # choice:promise]
    -> T6E
+ [把原文给我，我看看名单怎么划，再看看我的岗位。 # choice:file]
    -> D08_T6B
+ [我先不谈这一项。 # choice:later]
    -> desk

=== T6D ===
你这个岗位只碰公开资料，报价和后台都不开，相关会议也不用参加。我都写进权限确认了。 # speaker:meng
附件是统一发的。你这个岗位该不该受限制，我让负责人再看一眼。
+ [那就请确认，我到底符合名单里的哪项条件。 # choice:promise]
    -> T6E
+ [以后换了岗位、接触了新资料，也永远不可能有相关义务吧？ # choice:future]
    以后加什么活再具体说。这张表只管你现在这个岗位。 # speaker:meng
    -> T6D
+ [权限确认我保存，回头再看附件。 # choice:later]
    -> desk

=== T6E ===
{has_proof("P6"):
    -> T6resume
}
-> invite_zheng ->
名单按附件标准走，不是随便加人。你的岗位就在里面，和现在的权限安排一致。 # speaker:zheng
# proof:P6
-> END

=== T6F ===
你现在确实碰不到报价和后台。可孟乔刚把你带熟，你转身去了同行，我们还不得重新带一个？ # speaker:zheng
+ [怕重新带人我理解，但这份文件说的是保密信息。请按我实际做的工作取消限制，该保密的我照样保密。 # choice:remove]
    -> T6G
+ [那改成一年、五万就行？我适不适合进名单，反而不重要了？ # choice:less]
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
这个岗位的离职竞业和违约金可以取消，账号和资料该保密、该交还的照旧。以后工作内容真变了再谈，别今天就把以后全定死。 # speaker:zheng
把我从名单里删掉，正文也别再指向那份要审批下一份工作的附件。 # player
可以。名单、任职审批、那十万违约金一起撤。许然，把整套新版发出来。 # speaker:zheng
-> T6GOptions

=== T6GOptions ===
+ [就这么改，正文和附件我都要看。 # choice:accept]
    -> applyA6
+ [我以后保存公开作品链接的事，能请孟乔再说一下？ # choice:portfolio]
    -> T6portfolio
+ [我想先读完现有文字，再确认。 # choice:later]
    -> desk

=== T6portfolio ===
-> invite_meng ->
公开页面链接可以留，也可以写清楚自己负责哪部分。但客户原文件别直接拷走，署名也得看客户授权。 # speaker:meng
-> T6GOptions

=== T6H ===
两年可以缩，十万也能谈。但只改数字，你还在名单里，换工作照样要审。 # speaker:zheng
少一年、少五万，听着是让步了。可我问的根本不是价钱，是凭什么限制我。 # thought
+ [还是回到刚才的问题：我这个岗位不该受限，请取消。 # choice:remove]
    -> T6G
+ [我先保留这份，之后再决定。 # choice:later]
    -> desk
+ [这个安排我不接受，这次不签。 # choice:leave]
    -> leave_now

=== T6I ===
已经公开的东西，不会因为你处理过就变成秘密。但账号不能借人，个人信息不能带走，这些没得商量。 # speaker:zheng
+ [这些我认。我要删的是这个岗位的任职限制和违约金。 # choice:remove]
    -> T6G
+ [那公开作品的链接和工作原文件，也得分开看授权？ # choice:portfolio]
    对。公开不等于版权归你，原文件和署名另说。你负责哪部分，孟乔可以证明。 # speaker:zheng
    -> T6I
+ [我再看看附件，暂时不确认。 # choice:later]
    -> desk

=== T6R ===
现在我不在这份离职竞业名单里，之后去同类公司不需要按这份附件找你们审批？ # player
对，就现在这个岗位，限制撤了。公司资料该怎么保密，还是怎么办。 # speaker:zheng
+ [把改过的附件翻出来，我存一下。 # choice:locate]
    # locate:D08
    -> desk
+ [如果以后真换了接触其他资料的岗位，再具体确认？ # choice:future]
    对。以后岗位真变了再谈，不能拿今天这份一套到底。 # speaker:zheng
    -> desk
+ [明白，我继续看。 # choice:later]
    -> desk

=== T7A ===
常驻地点写的是这里。客户多了，会不会让我长期去外地驻场？ # player
这个岗位就在本市。长期换地方得再跟你书面谈；临时在本市跑一趟，会提前说去哪儿、做什么。
+ [我不接受长期变地点，就不能拿这一条当成我提前同意了？ # choice:consent]
    对，这条不等于你以后去哪儿都已经同意了。
    -> desk
+ [工作电脑需要押金吗，坏了会直接从工资扣吗？ # choice:equipment]
    -> T7B
+ [能直接改成我自己决定每天在家还是来公司吗？ # choice:remote]
    -> T7C

=== T7B ===
押金不收。领电脑、还电脑都记好状态，有故障先查原因，不会电脑一坏就从你工资里扣。
+ [交还的时候给我一份接收记录。 # choice:receipt]
    会给。离场指引也写了，可以发到你个人邮箱。
    # file:D09
    -> desk
+ [那设备本身可以不还，反正没押金？ # choice:keep]
    没收押金，可也没说电脑送你呀。该还的还得按清单还。
    -> T7A
+ [这条清楚了。 # choice:later]
    -> desk

=== T7C ===
-> invite_meng ->
我们招的就是到岗，审稿、协作都按到岗排。偶尔有事能商量，但每天来不来全由你定，这个我给不了。 # speaker:meng
+ [明白，这次报价本来就是到岗。我继续看合同。 # choice:later]
    -> desk
+ [完全居家是我接受工作的条件，那这次就不签了。 # choice:leave]
    -> leave_now
+ [你现在必须答应每天由我选，否则不谈任何别的条款。 # choice:insist]
    这个我真答应不了。 # speaker:meng
    # deadlock:L7
    -> END

=== T8A ===
签之前，我想把正文提到的附件都看齐。目录里这些现在能发吗？ # player
能。你想一份份看，还是我一次把整套发你？
+ [把还没发的签署附件一次给我，我看完再继续。 # choice:pack]
    -> T8B
+ [我先看离场交接和账户怎么处理。 # choice:exit]
    -> D09_T8C
+ [我想确认当前到底用哪些版本，已改的不能被旧附件盖回去。 # choice:versions]
    -> T8D

=== T8B ===
登记、结算、分工、保障、保密、离场指引都在。你慢慢看，改过的发最新版，原版也留着给你对。
# signing:request
文件总算齐了。看没看懂是另一回事，哪里别扭就接着问。 # thought
-> desk

=== D09_T8C ===
# request:D09
-> T8C

=== T8C ===
设备、资料交完，主管给你接收记录，再关账号。工资怎么申请，要看结算说明另一段。
+ [主管给的收据包含我自己的出勤日期吗？ # choice:receipt]
    有你自己的那份，可以发个人邮箱。
    -> desk
+ [结算说明也给我，我想看看销号之后怎么申请。 # choice:settlement]
    # request:D04
    {has_amendment("A4"):
        账号照关，工资改用个人邮箱申请。这两份新版都得留好。 # thought
    - else:
        一边要关账号，一边又要我登录。得把两个时间摆在一起看看。 # thought
    }
    -> desk
+ [我先把交接流程保存。 # choice:later]
    -> desk

=== T8D ===
目录会写清这次签哪一版。新稿替旧稿，旧句只是留个修改记录，不是发过的每份都同时算数。
+ [打开现在的签署包，我再核一下。 # choice:pack]
    -> T8versions
+ [我核对完了，就谈到这儿。 # choice:review]
    # review
    -> T8DOptions
+ [我还有问题，回合同继续谈。 # choice:later]
    -> desk

=== T8DOptions ===
+ [打开现在的签署包，我再核一下。 # choice:pack]
    -> T8versions
+ [我核对完了，就谈到这儿。 # choice:review]
    # review
    -> T8DOptions
+ [我还有问题，回合同继续谈。 # choice:later]
    -> desk

=== T8versions ===
# signing:review
-> T8DOptions

=== p1step1 ===
她说拨款是内部的事。可数字那边的钱没到，商务真会照常付吗？ # thought
-> END

=== p1wrong ===
这段本身没问题，但它答的不是你刚才问的那件事。
对，我还是不知道数字不打款时，商务到底垫不垫。 # thought
-> END

=== p1roles ===
分工是写清楚了。可我问的是没钱的时候谁来付。
谁干什么跟谁来垫钱，根本是两回事。我找错句子了。 # thought
-> END

=== p1transfer ===
这段只写钱怎么转，不代表一定要晚发。
也是，转一道和拖着不发不是一回事。我得找那句「收不到款就不付」。 # thought
-> END

=== p1money ===
七千六、十号发，这些我没改口。
这两处确实一样。可数字不打款时怎么办，还是没回答。 # thought
-> END

=== p1right ===
你说商务会先付，数字拨不拨款都不影响我。可单上写着「未收到时不承担先行支付责任」。真没拨款时，到底听你的还是听单子的？能把哪家公司负责按时发工资写下来吗？我需要的不只是有人帮我协调。 # player
-> T1F

=== applyA1 ===
甲方和分工单都换了。商务还能代办，但该按时付钱的是数字，这点跑不掉。
# amend:A1
总算有一家公司白纸黑字认下了。剩下的条件，再一份一份对。 # thought
-> desk

=== p2step1 ===
说着是让我先熟悉工作，怎么合同里就变成了先做三个月「实践」，期满才正式录用？ # thought
-> END

=== p2step2 ===
我来面试的是全职，他们也问过我毕业没有。怎么现在成了实践人员？ # thought
-> END

=== p2step3 ===
她说先熟悉工作。那我到岗之后，是跟着学，还是有一份活要自己交？ # thought
-> END

=== p2step4 ===
要是从报到那天起就得按组里的安排干活，那这三个月到底跟正式上班差在哪儿？ # thought
-> END

=== p2wrong ===
这些材料各自都没错，但还说明不了这份实践到底哪里不对。
光看文件名字没用。得把两件事摆出来：他们明知我来找全职，还让我从第一天干正式活。 # thought
-> END

=== p2status ===
你毕业了，这点我没弄错。可这跟三个月实践怎么安排，还是两回事。
光拿毕业日期不够。还得证明他们给我安排的根本不是实习，而是正式工作。 # thought
-> END

=== p2work ===
有工作安排是真的。可你登记成什么身份、合同那三个月怎么算，也得一起看。
这能说明我会接活。要说清这三个月的问题，还得把工作的安排和他们给我定的入职身份放在一起。 # thought
-> END

=== p2hours ===
按时到岗只能说明你来了，不能说明你来了做什么。
只证明几点上班不够。得找派活、审稿、交付那些安排。 # thought
-> END

=== p2right ===
合同让我先做三个月「实践」，期满才正式录用。可你们明知道我毕业了，是来干全职的；从第一周就按班次到岗，孟乔派活、审稿，做完的东西还要正式发布。有人带我熟悉工作，不代表我这三个月就没上班。试用期可以谈，但不能活照干，劳动合同却拖到三个月以后。 # player
-> T2E

=== p2schedule ===
这里写着先做三个月实践，期满才录用。可你们知道我已经毕业，就是来找全职的。首周安排也让我一报到就按班次出勤，主管派活、审稿，合同列的就是这个岗位的日常任务。试用期可以写进劳动合同。我想从报到就把合同签好，别等三个月后才办手续。 # player
-> T2E

=== p2interview ===
这里让我先做三个月实践，期满才录用。可你们明知道我毕业了，是来干全职的。孟乔面试时也说了，一进组就做资讯和尺寸适配，她派活、看稿、记考勤。带新人不等于新人没在工作。试用期可以谈，但不能让我先干三个月正式活，手续却说还没开始。 # player
-> T2E

=== applyA2 ===
劳动合同从十二月一号算，一年；头两个月是试用，七千六不降。登记也一起改。
# amend:A2
有人带是一回事，从哪天正式入职是另一回事。这回终于没再混在一起。 # thought
-> desk

=== p3step1 ===
她说只是攒一批再办。可我要是第五天走了，到了下一批还能领到那五天的钱吗？ # thought
-> END

=== p3wrong ===
我说的是有钱，只是一批批发。你这句还证明不了干不满七天就不给。
是啊，我还得找到那句：这几天不仅晚发，以后也不补。 # thought
-> END

=== p3same ===
这句跟我说的一样，都是上过的班会结。
对，这只能证明她前后说的一样。真正相反的说法应该在结算说明里。 # thought
-> END

=== p3work ===
活干了、记录也留了，这点没人否认。现在说的是钱到底给不给。
这是说我入组后要干什么，记录会怎么留。可假如真干了五天就走，能不能领钱，还得看结算条件。 # thought
-> END

=== p3date ===
十号是哪天发钱。头七天算不算钱，是另一回事。
我把发钱日期和给不给钱混在一起了。得回去找七天那道门槛。 # thought
-> END

=== p3right ===
这哪是晚一批发？单上写的是没满七天就走，这几天只记「适应」，不进工资，而且以后也不补。那我干了五天再正常离开，你嘴上说五天都有钱，单子却一分不认。请按实际上班的天数算，把七天这道门槛删掉。 # player
-> T4F

=== applyA3 ===
「没满七天不给钱」这句删了。以后干过的班按出勤算，不再只记一笔「适应」。
# amend:A3
五天也是五天，钱不能没了。至于走的时候怎么申请，还得看后面的流程。 # thought
-> desk

=== p4step1 ===
她说关账号不影响申请，可结算页不是也要用工作账号登录吗？这里总觉得不对。 # thought
-> END

=== p4step2 ===
交接、关账号、报结算。要是这几步的时间没接上，我还能把申请交进去吗？ # thought
-> END

=== p4wrong ===
我还是没听出来，按这个流程你到底哪儿办不了。
单看每句都像能办。得把账号关闭和申请开放的时间摆在一起，才能看出卡在哪儿。 # thought
-> END

=== p4time ===
人走关账号，这没问题。我又没说不让关。
对，关账号本身没错。真正不对的是关的时候，申请还没开。 # thought
-> END

=== p4receipt ===
收据能发邮箱，可工资申请不走这个邮箱。
也是，收一张收据和提交一笔结算是两回事。我找错地方了。 # thought
-> END

=== p4gate ===
先说已经够结算条件的人。七天那件事可以另谈。
对，够条件以后还是登不上，才是这里的死结。七天那条先放一边。 # thought
-> END

=== p4right ===
离场当天下午六点，工作账号就关了，结算页也跟着上不去。可你们又规定，申请要等交接后的下一个工作日才开，还不能提前报。照这个时间走，我能登录时不能申请，能申请时又登不上了。请给我一个不用工作账号的入口，再写清谁收申请、谁核出勤、谁把该给的钱结给我。 # player
-> T4L

=== applyA4 ===
三份都改了。账号照关，工资用个人邮箱申请；人事给回执，再交给能核的人处理。
# amend:A4
这回不用求人临时开账号了。人走以后怎么办，文件里终于有了一条能走通的路。 # thought
-> desk

=== p5step1 ===
她面试时说从报到开始参保。这个「晚点办」，晚的是手续，还是参保的起点？ # thought
-> END

=== p5step2 ===
我在前面这段时间也照常上班。她说中间不会少，纸上能看出来吗？ # thought
-> END

=== p5wrong ===
这些句子还不能说明，到底是晚点交，还是前三个月根本不交。
对，「晚一点办」和「这三个月不算」差远了。我得找不申报、不补交那几句。 # thought
-> END

=== p5bonus ===
有四百补助，不代表社保也交了。
钱和社保还是被我混在一起了。得看从哪天开始、前面补不补。 # thought
-> END

=== p5money ===
四百是另外给的，七千六没变。这个数没问题。
工资没写错。我要查的是社保有没有少三个月，不是这四百怎么算。 # thought
-> END

=== p5term ===
{has_amendment("A2"):
    劳动合同改了，可这张选择单没跟着改。
- else:
    这段写的是实践什么时候结束，参保要看另一份单子。
}
入职身份和参保时间是两件事。参保从哪天算，就看选择单自己怎么写。 # thought
-> END

=== p5right ===
面试时说从报到开始参保，选择单却写前三个月不交，正式录用后才开始，前面也不补。这不是晚点办，是直接少交三个月。四百块也买不回这三个月的记录。请把从上班起依法参保写进正文，把延后办理和不补交都删掉。 # player
{has_amendment("A2"):
    劳动合同已经改了，这张旧单也得删干净，别一边写入职参保，一边又空着三个月。 # player
}
-> T5F

=== p5spoken ===
你刚说报到以后不会少，可单上明明写着前三个月不交，以后也不补。这不是晚一点办，是实打实空三个月。请把这段删掉，写清楚从上班起就该参保。 # player
{has_amendment("A2"):
    劳动合同已经改了，这张旧单也得删干净，别一边写入职参保，一边又空着三个月。 # player
}
-> T5F

=== applyA5 ===
前三个月不交的安排删了，固定七千六不动，四百替代补助取消。办理信息由人事给你。
# amend:A5
固定工资还是七千六。从我实际开始上班的那天算参保，这回两份文件都写清楚了。 # thought
-> desk

=== p6step1 ===
他这么肯定我在名单里。这个岗位算进去，到底是因为我平时会接触什么？ # thought
-> END

=== p6step2 ===
我去的是内容组，又不是去管客户生意。日常做的那些活，真符合他说的范围吗？ # thought
-> END

=== p6step3 ===
他说我就在名单里。以后换工作还得来找他，这事不能光听他说「对得上」。 # thought
-> END

=== p6wrong ===
你拿这几段想说明什么？我没看出它们跟名单有什么关系。 # speaker:zheng
我还没把话连起来。得先找名单按什么划，再证明我根本碰不到那些资料。 # thought
-> END

=== p6role ===
岗位叫什么、工资多少，跟你能看什么资料是两回事。 # speaker:zheng
对，名头说明不了权限。我得找他给我安排的实际工作和资料范围。 # thought
-> END

=== p6fine ===
年限、金额都可以谈。这跟我为什么把你列进名单，是两回事。 # speaker:zheng
他还是在跟我谈价钱。可我想问的是凭什么限制我，得回到名单的标准。 # thought
-> END

=== p6secret ===
不碰经营资料，也得守账号和个人信息。这跟你为什么在名单里，没关系。 # speaker:zheng
日常保密我认，可它证明不了竞业名单为什么有我。这两件事不能混。 # thought
-> END

=== p6defer ===
-> defer_words ->
行，你看清楚再说。 # speaker:zheng
-> END

=== p6right ===
附件说，是否进名单要看有没有接触未公开报价、投放和经营数据，普通公开内容岗位不算。可孟乔给我的岗位安排里，看不出我会接触这些信息。后面却把这批人一股脑列进名单，连以后去做什么都不管。该保密的我会照做，能不能把这个岗位的任职限制删掉？ # player
-> T6F

=== p6spoken ===
附件写明，整理公开内容的普通岗位不在名单里。孟乔给我的安排也写着，我做的是公开资料。可你刚才又说我就在名单里。该保密的我照做，但下一份工作去哪儿，不该被这张名单管着。 # player
-> T6F

=== applyA6 ===
这个岗位已经从名单里删了，任职审批和十万违约金一起去掉。日常保密那条还留着。
# amend:A6
至少下份工作去哪儿，不再被这张名单提前管死了。该保密的资料，我照样会守好。 # thought
-> desk

=== p6card ===
校园卡我看到了。没人怀疑你上过学，可这跟我们刚才说的那条有什么关系？ # speaker:zheng
卡是真的，可对上这件事也没用。 # thought
-> END


=== proof_defer ===
-> defer_words ->
行，你看清楚再说。
-> END

=== defer_words ===
现在这几句还说不到一块儿。先别硬争，我回去再翻翻。 # thought
这句我先记着，等我翻完原文再接着问。 # player
->->

=== invite_meng ===
{not mengJoined:
    ~ mengJoined = true
    具体做什么，我让孟乔跟你说。以后就是她带你。
    我在。你面试做的小样我看了。想问第一周做什么，还是稿子怎么交？ # speaker:meng
}
->->

=== invite_zheng ===
{not zhengJoined:
    ~ zhengJoined = true
    这项我改不了。我把郑衡拉进来，这边用人安排归他管，刚才说的我也转给他了。
    我看到了。要改哪条直接说。岗位和七千六的预算不动。 # speaker:zheng
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
