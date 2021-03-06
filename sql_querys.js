var getTODAY = `WITH byDate as (
    select spiel.id 
    from spiel 
    where datum between date '2021-04-06' - interval '6 hours' and date '2021-04-06'
), getTODAY as (
select x.plus - y.minus as today, x.name
from 
    --Plus
    (
        select SUM(s.punkte) as plus, sp.name
        from spiel s, kontra sK, re sRe, spieler sp
        where s.kontra = sK.id 
        and s.re = sRe.id 
        and s.id in (select * from byDate)
        and s.sieger =  (
            select case when exists (
                select * 
                from Re 
                where (sp.name = spieler1 or sp.name = spieler2) 
                and id = sRe.id
            ) then 'Re'
            when exists (
                select * 
                from kontra 
                where (sp.name = spieler1 or sp.name = spieler2) 
                and id = sK.id
            ) then 'Kontra'
            else 'Spielt nicht' end
        )
        group by sp.name
    ) x,
    --Minus
    (
        select SUM(s.punkte) as minus, sp.name
        from spiel s, kontra sK, re sRe, spieler sp
        where s.kontra = sK.id 
        and s.re = sRe.id 
        and s.id in (select * from byDate)
        and s.sieger != (
            select case when exists (
                select * 
                from Re 
                where (sp.name = spieler1 or sp.name = spieler2) 
                and id = sRe.id
            ) then 'Re'
            when exists (
                select * 
                from kontra 
                where (sp.name = spieler1 or sp.name = spieler2) 
                and id = sK.id
            ) then 'Kontra'
            else 'Spielt nicht' end
        )
        group by sp.name
    ) y
where y.name = x.name 
)`

function byDate(gruppe, first) {
    var result = ""
    if (first) result = result + "With "
    else result = result + ", "
    result = result + `
    byDate as (
        select spiel.id 
        from spiel 
        where datum between current_timestamp - interval '12 hours' and current_timestamp
    )`
    return result
}

function total(gruppe, first) {
    var result = ""
    if (first) result = result + "With "
    else result = result + ", "
    result = result + ` 
    Plus_Re_SoloT as (
        select SUM(s.punkte*3) as punkte, sp.name
        from spiel s, re sRe, spieler sp
        where s.re = sRe.id 
        and sRe.solo is not null
        and s.sieger =  'Re'
        and (sp.name = sRe.spieler1 or sp.name = sRe.spieler2)
        and s.gruppe = ` + gruppe + `
        group by sp.name
    ), 
    Plus_ReT as (
        select SUM(s.punkte) as punkte, sp.name
        from spiel s, re sRe, spieler sp
        where s.re = sRe.id 
        and sRe.Solo is null
        and s.sieger =  'Re'
        and (sp.name = sRe.spieler1 or sp.name = sRe.spieler2)
        and s.gruppe = ` + gruppe + `
        group by sp.name
    ), 
    Minus_Re_SoloT as (
        select SUM(s.punkte*3) as punkte, sp.name
        from spiel s, re sRe, spieler sp
        where s.re = sRe.id 
        and sRe.Solo is not null
        and s.sieger =  'Kontra'
        and (sp.name = sRe.spieler1 or sp.name = sRe.spieler2)
        and s.gruppe = ` + gruppe + `
        group by sp.name
    ), 
    Minus_ReT as (
        select SUM(s.punkte) as punkte, sp.name
        from spiel s, re sRe, spieler sp
        where s.re = sRe.id 
        and sRe.Solo is null
        and s.sieger =  'Kontra'
        and (sp.name = sRe.spieler1 or sp.name = sRe.spieler2)
        and s.gruppe = ` + gruppe + `
        group by sp.name
    ), 
    Plus_KontraT as (
        select SUM(s.punkte) as punkte, sp.name
        from spiel s, kontra, spieler sp
        where s.kontra = kontra.id 
        and s.sieger =  'Kontra'
        and (sp.name = kontra.spieler1 or sp.name = kontra.spieler2 or sp.name = kontra.spieler3)
        and s.gruppe = ` + gruppe + `
        group by sp.name
    ), 
    Minus_KontraT as (
        select SUM(s.punkte) as punkte, sp.name as name
        from spiel s, kontra, spieler sp
        where s.kontra = kontra.id 
        and s.sieger =  'Re'
        and (sp.name = kontra.spieler1 or sp.name = kontra.spieler2 or sp.name = kontra.spieler3)
        and s.gruppe = ` + gruppe + `
        group by sp.name
    ),
    Minus_FehlspielT as (
        select SUM(3 * g.kategorie) as punkte, f.spieler as name
        from spiel s, fehlspiel f, fehlspielgrund g
        where s.fehlspiel = f.id
        and f.grund = g.id
        and s.gruppe = ` + gruppe + `
        group by f.spieler
    ),
    Plus_FehlspielT as (
        select SUM(g.kategorie) as punkte, sp.name
        from spiel s, fehlspiel f, fehlspielgrund g, re, kontra, spieler sp
        where s.fehlspiel is not null
        and s.fehlspiel = f.id
        and f.grund = g.id
        and s.re = re.id
        and s.kontra = kontra.id
        and not sp.name = f.spieler
        and (sp.name = re.spieler1 or sp.name = re.spieler2 or sp.name = kontra.spieler1 or sp.name = kontra.spieler2 or sp.name = kontra.spieler3 )
        and s.gruppe = ` + gruppe + `
        group by sp.name
    ),
    SummandenT as (
        select 
            coalesce(PRS.punkte, 0) as Plus_Re_SoloT, 
            coalesce(PR.punkte, 0) as Plus_ReT, 
            coalesce(MRS.punkte, 0) as Minus_Re_SoloT, 
            coalesce(MR.punkte, 0) as Minus_ReT,
            coalesce(PK.punkte, 0) as Plus_KontraT, 
            coalesce(MK.punkte, 0) as Minus_KontraT,  
            coalesce(PF.punkte, 0) as Plus_FehlspielT,  
            coalesce(MF.punkte, 0) as Minus_FehlspielT,  
            gm.spieler
        from 
            gruppenmitglieder gm
            full join 
            Plus_Re_SoloT PRS 
            on gm.spieler = PRS.name
            full join 
            Plus_ReT PR
            on gm.spieler = PR.name
            full join
            Minus_Re_SoloT MRS
            on gm.spieler = MRS.name
            full join
            Minus_ReT MR
            on gm.spieler = MR.name
            full join
            Plus_KontraT PK
            on gm.spieler = PK.name
            full join
            Minus_KontraT MK
            on gm.spieler = MK.name
            full join
            Minus_FehlspielT MF
            on gm.spieler = MF.name
            full join
            Plus_FehlspielT PF
            on gm.spieler = PF.name
            
        where 
            gruppe = ` + gruppe + `
    ),
    total as (
        select S.Plus_Re_SoloT + S.Plus_ReT + S.Plus_KontraT + Plus_FehlspielT - S.Minus_Re_SoloT - S.Minus_ReT  - S.Minus_KontraT - S.Minus_FehlspielT as total, S.spieler
        from SummandenT S
    )`
    return result
}

function today(gruppe, first) {
    var result = ""
    if (first) result = result + "With "
    else result = result + ", "
    result = result + `
    Plus_Re_Solo as (
        select SUM(s.punkte*3) as punkte, sp.name
        from spiel s, re sRe, spieler sp
        where s.re = sRe.id 
        and s.id in (select * from byDate)
        and sRe.solo is not null
        and s.sieger =  'Re'
        and (sp.name = sRe.spieler1 or sp.name = sRe.spieler2)
        and s.gruppe = ` + gruppe + `
        group by sp.name
    ), 
    Plus_Re as (
        select SUM(s.punkte) as punkte, sp.name
        from spiel s, re sRe, spieler sp
        where s.re = sRe.id 
        and s.id in (select * from byDate)
        and sRe.Solo is null
        and s.sieger =  'Re'
        and (sp.name = sRe.spieler1 or sp.name = sRe.spieler2)
        and s.gruppe = ` + gruppe + `
        group by sp.name
    ), 
    Minus_Re_Solo as (
        select SUM(s.punkte*3) as punkte, sp.name
        from spiel s, re sRe, spieler sp
        where s.re = sRe.id 
        and s.id in (select * from byDate)
        and sRe.Solo is not null
        and s.sieger =  'Kontra'
        and (sp.name = sRe.spieler1 or sp.name = sRe.spieler2)
        and s.gruppe = ` + gruppe + `
        group by sp.name
    ), 
    Minus_Re as (
        select SUM(s.punkte) as punkte, sp.name
        from spiel s, re sRe, spieler sp
        where s.re = sRe.id 
        and s.id in (select * from byDate)
        and sRe.Solo is null
        and s.sieger =  'Kontra'
        and (sp.name = sRe.spieler1 or sp.name = sRe.spieler2)
        and s.gruppe = ` + gruppe + `
        group by sp.name
    ), 
    Plus_Kontra as (
        select SUM(s.punkte) as punkte, sp.name
        from spiel s, kontra, spieler sp
        where s.kontra = kontra.id 
        and s.id in (select * from byDate)
        and s.sieger =  'Kontra'
        and (sp.name = kontra.spieler1 or sp.name = kontra.spieler2 or sp.name = kontra.spieler3)
        and s.gruppe = ` + gruppe + `
        group by sp.name
    ), 
    Minus_Kontra as (
        select SUM(s.punkte) as punkte, sp.name
        from spiel s, kontra, spieler sp
        where s.kontra = kontra.id 
        and s.id in (select * from byDate)
        and s.sieger =  'Re'
        and (sp.name = kontra.spieler1 or sp.name = kontra.spieler2 or sp.name = kontra.spieler3)
        and s.gruppe = ` + gruppe + `
        group by sp.name
    ),
    Summanden as (
        select 
            coalesce(PRS.punkte, 0) as Plus_Re_Solo, 
            coalesce(PR.punkte, 0) as Plus_Re, 
            coalesce(MRS.punkte, 0) as Minus_Re_Solo, 
            coalesce(MR.punkte, 0) as Minus_Re,
            coalesce(PK.punkte, 0) as Plus_Kontra, 
            coalesce(MK.punkte, 0) as Minus_Kontra,  
            gm.spieler
        from 
            gruppenmitglieder gm
            full join 
            Plus_Re_Solo PRS 
            on gm.spieler = PRS.name
            full join 
            Plus_Re PR
            on gm.spieler = PR.name
            full join
            Minus_Re_Solo MRS
            on gm.spieler = MRS.name
            full join
            Minus_Re MR
            on gm.spieler = MR.name
            full join
            Plus_Kontra PK
            on gm.spieler = PK.name
            full join
            Minus_Kontra MK
            on gm.spieler = MK.name
            
        where 
            gruppe = ` + gruppe + `
    ),
    today as (
        select S.Plus_Re_Solo + S.Plus_Re + S.Plus_Kontra - S.Minus_Re_Solo - S.Minus_Re  - S.Minus_Kontra as today, S.spieler
        from Summanden S
    )`
    return result
}

function Your_History(gruppe, name, first) {
    var result = ""
    if (first) result = result + "With "
    else result = result + ", "
    result = result + `
    ` + name + `_history as (
        select 
            case 
                when (gm.spieler = re.spieler1 or gm.spieler = re.spieler2) then 
                    case 
                        when re.solo is not null then 
                            case 
                                when s.sieger = 'Re' then s.punkte * 3
                                else s.punkte * -3
                            end
                        else 
                            case 
                                when s.sieger = 'Re' then s.punkte 
                                else s.punkte * -1
                            end
                    end
                when (gm.spieler = kontra.spieler1 or gm.spieler = kontra.spieler2 or gm.spieler = kontra.spieler3) then
                    case 
                        when s.sieger = 'Kontra' then s.punkte 
                        else s.punkte * -1
                    end
                else 0
            end as calc,
            gm.spieler as spieler, s.datum as datum
        from spiel s, re, kontra, gruppenmitglieder gm
        where s.re = re.id
        and s.kontra = kontra.id
        and gm.gruppe = ` + gruppe + `
        and gm.spieler = '` + name + `'
        and s.gruppe = ` + gruppe + `
        order by s.datum
        )`
    return result
}


function solo_countdown(gruppe, first) {
    var result = ""
    if (first) result = result + "With "
    else result = result + ", "
    result = result + `
    Solo_Countdown as (
        Select coalesce(X.num, 30) as num, g.spieler 
        from (
            Select 30 - count(*) as num , gm.spieler
            from spiel, re, kontra ,gruppenmitglieder gm
            where spiel.id > (
                select coalesce(max(spiel.id), 0)
                from spiel, re
                where spiel.re = re.id
                and (gm.spieler = re.spieler1 or gm.spieler = re.spieler2)
                and re.solo in ('Bubensolo', 'Damensolo', 'Fleischloser', 'Farbsolo')
            )
            and spiel.gruppe = ` + gruppe + `
            and gm.gruppe = ` + gruppe + `
            and spiel.re = re.id
            and spiel.kontra = kontra.id
            and (gm.spieler = re.spieler1 or gm.spieler = re.spieler2 or gm.spieler = kontra.spieler1 or gm.spieler = kontra.spieler2 or gm.spieler = kontra.spieler3)
            group by gm.spieler
        ) as X
        right join 
        gruppenmitglieder g
        on g.spieler = X.spieler
        where g.gruppe = ` + gruppe + `
    )`
    return result
}

module.exports = {
    getSpieler: function(gruppe) {
        return byDate(gruppe, true) + total(gruppe, false) + today(gruppe, false) + solo_countdown(gruppe, false) + `
            select total.spieler, today.today as today, total.total as total, solo_countdown.num as solo_countdown, bild
            from total, today, solo_countdown, spieler ss
            where total.spieler = today.spieler
            and total.spieler = solo_countdown.spieler
            and ss.name = total.spieler
            order by total.total desc;`
    },
    insertResponse: function(kontra_spieler1, kontra_spieler2, kontra_spieler3, re_spieler1, re_spieler2, gruppe) {
        return getTODAY + `
            select gT.name, solo_countdown, punkte, today
            from gruppenmitglieder gm, spieler sp, getTODAY gT
            where gm.spieler = sp.name
            and gruppe = ` + gruppe + `
            and gT.name = sp.name
            and sp.name in (` + kontra_spieler1 + ", " + kontra_spieler2 + ", " + kontra_spieler3 + ", " + re_spieler1 + ", " + re_spieler2 + `);`
    },
    delete_last: function(gruppe) {
        return `
            select spiel.re into tempR from spiel where gruppe = ` + gruppe + ` order by id desc limit 1;
            select spiel.kontra into tempK from spiel where gruppe = ` + gruppe + ` order by id desc limit 1;
            Delete from spiel where id = (select id from spiel where gruppe = ` + gruppe + ` order by id desc limit 1);
            Delete from re where re.id = (select * from tempR);
            Delete from kontra where kontra.id = (select * from tempK);
            Drop table tempK;
            Drop table tempR;`
    },
    delete_spiel: function(id) {
        return `
            select spiel.re into tempR from spiel where id = ` + id + `;
            select spiel.kontra into tempK from spiel where id = ` + id + `;
            Delete from spiel where id = ` + id + `;
            Delete from re where re.id = (select * from tempR);
            Delete from kontra where kontra.id = (select * from tempK);
            Drop table tempK;
            Drop table tempR;`
    },
    highlevelstats: function(gruppe) {
        return byDate(gruppe, true) + total(gruppe, false) + today(gruppe, false) + solo_countdown(gruppe, false) + `
            select total.spieler, today.today as today, total.total as total, solo_countdown.num as solo_countdown
            from total, today, solo_countdown
            where total.spieler = today.spieler
            and total.spieler = solo_countdown.spieler
            order by total.total desc;`
    },
    history: function(gruppe, names) {
        var query = ""
        for (var i = 0; i < names.length; i++) {
            if (i === 0) query = query + Your_History(gruppe, names[i], true)
            else query = query + Your_History(gruppe, names[i], false)
        }
        query = query + "\nselect J.id, "
        for (var i = 0; i < names.length; i++) {
            query = query + names[i] + "_history.calc as " + names[i] + ", "
        }
        query = query + "to_char(J.datum, 'DD.MM.YY HH24:MI') as datum\nfrom "
        for (var i = 0; i < names.length; i++) {
            query = query + names[i] + "_history, "
        }
        query = query + "(select spiel.id, datum from spiel where spiel.gruppe = " + gruppe + ") as J\nwhere "
        for (var i = 0; i < names.length; i++) {
            if (i === names.length - 1) query = query + names[i] + "_history.datum = J.datum\norder by J.datum desc;"
            else query = query + names[i] + "_history.datum = J.datum and "
        }
        return query
    }
}