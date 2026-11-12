// SPDX-License-Identifier: CC-BY-4.0
EXTERNAL has_file(id)
EXTERNAL has_clue(id)
EXTERNAL in_game()

-> opening

=== opening ===
房子你可以先看一圈，交付的事我们当面说。
-> desk

=== ask_window ===
我想问问卧室窗户交付时是什么状态。 # player
窗户没什么要处理的，窗框和旁边的墙面也没有水渍。
{has_clue("window"):
    + [我刚才在窗边记下了一处情况。 # choice:show]
        -> window_claim
}
+ [我再回去看看。 # choice:later]
    -> desk

=== window_claim ===
窗框下边我看过，没有水渍。
# proof:window
-> END

=== window_thought ===
我看到的跟她说的不一样，先找出看房时记下的那一条。 # thought
-> END

=== window_offer ===
我的记录写着窗框下沿有水渍，旁边的墙漆也起泡了。能在交付前检查一下，再一起验收吗？ # player
行，原因我得找人来看。交房前检查和验收可以写进去。
+ [请把这个约定写进合同。 # choice:accept]
    -> apply_repair

=== apply_repair ===
我把交付前检查和共同验收都补上了。
# amend:repair
-> desk

=== after_repair ===
那窗框就按改稿验收？ # player
对，交房时我们一起看。
-> desk

=== window_wrong ===
这句没写窗框上有没有水渍。
-> END

=== window_defer ===
我先把手上的材料看清楚。 # thought
-> END

=== stale ===
你拿的是旧稿，我们按现在的版本核对。
-> END

=== end_topic ===
这条先放一放，我再看看房子。 # player
-> desk

=== desk ===
{in_game():
    # desk
    -> END
}
+ [预览 · 询问窗户 # choice:preview_window]
    -> ask_window

=== refused ===
我们先谈到这儿吧。
-> END

=== resume ===
我们能再说一下刚才那条吗？ # player
可以，你说。
-> END

=== refused_leave ===
那我今天就先不签了。 # player
-> END

=== finish_sign ===
我按现在这版签。 # player
好，我们各留一份。
-> END

=== finish_leave ===
我先不签，今天谢谢你。 # player
-> END

=== function has_file(id) ===
~ return false

=== function has_clue(id) ===
~ return false

=== function in_game() ===
~ return false
