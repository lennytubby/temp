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

var total = `, 
Plus_Re_SoloT as (
    select SUM(s.punkte*3) as punkte, sp.name
    from spiel s, re sRe, spieler sp
    where s.re = sRe.id 
    and sRe.solo is not null
    and s.sieger =  'Re'
    and (sp.name = sRe.spieler1 or sp.name = sRe.spieler2)
    group by sp.name
), 
Plus_ReT as (
    select SUM(s.punkte) as punkte, sp.name
    from spiel s, re sRe, spieler sp
    where s.re = sRe.id 
    and sRe.Solo is null
    and s.sieger =  'Re'
    and (sp.name = sRe.spieler1 or sp.name = sRe.spieler2)
    group by sp.name
), 
Minus_Re_SoloT as (
    select SUM(s.punkte*3) as punkte, sp.name
    from spiel s, re sRe, spieler sp
    where s.re = sRe.id 
    and sRe.Solo is not null
    and s.sieger =  'Kontra'
    and (sp.name = sRe.spieler1 or sp.name = sRe.spieler2)
    group by sp.name
), 
Minus_ReT as (
    select SUM(s.punkte*3) as punkte, sp.name
    from spiel s, re sRe, spieler sp
    where s.re = sRe.id 
    and sRe.Solo is null
    and s.sieger =  'Kontra'
    and (sp.name = sRe.spieler1 or sp.name = sRe.spieler2)
    group by sp.name
), 
Plus_KontraT as (
    select SUM(s.punkte) as punkte, sp.name
    from spiel s, kontra, spieler sp
    where s.kontra = kontra.id 
    and s.sieger =  'Kontra'
    and (sp.name = kontra.spieler1 or sp.name = kontra.spieler2 or sp.name = kontra.spieler3)
    group by sp.name
), 
Minus_KontraT as (
    select SUM(s.punkte) as punkte, sp.name
    from spiel s, kontra, spieler sp
    where s.kontra = kontra.id 
    and s.sieger =  'Re'
    and (sp.name = kontra.spieler1 or sp.name = kontra.spieler2 or sp.name = kontra.spieler3)
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
        
    where 
        gruppe = 1
),
total as (
    select S.Plus_Re_SoloT + S.Plus_ReT + S.Plus_KontraT - S.Minus_Re_SoloT - S.Minus_ReT  - S.Minus_KontraT as total, S.spieler
    from SummandenT S
)`

var today = `
WITH byDate as (
    select spiel.id 
    from spiel 
    where datum between current_timestamp - interval '24 hours' and current_timestamp
), 
Plus_Re_Solo as (
    select SUM(s.punkte*3) as punkte, sp.name
    from spiel s, re sRe, spieler sp
    where s.re = sRe.id 
    and s.id in (select * from byDate)
    and sRe.solo is not null
    and s.sieger =  'Re'
    and (sp.name = sRe.spieler1 or sp.name = sRe.spieler2)
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
    group by sp.name
), 
Minus_Re as (
    select SUM(s.punkte*3) as punkte, sp.name
    from spiel s, re sRe, spieler sp
    where s.re = sRe.id 
    and s.id in (select * from byDate)
    and sRe.Solo is null
    and s.sieger =  'Kontra'
    and (sp.name = sRe.spieler1 or sp.name = sRe.spieler2)
    group by sp.name
), 
Plus_Kontra as (
    select SUM(s.punkte) as punkte, sp.name
    from spiel s, kontra, spieler sp
    where s.kontra = kontra.id 
    and s.id in (select * from byDate)
    and s.sieger =  'Kontra'
    and (sp.name = kontra.spieler1 or sp.name = kontra.spieler2 or sp.name = kontra.spieler3)
    group by sp.name
), 
Minus_Kontra as (
    select SUM(s.punkte) as punkte, sp.name
    from spiel s, kontra, spieler sp
    where s.kontra = kontra.id 
    and s.id in (select * from byDate)
    and s.sieger =  'Re'
    and (sp.name = kontra.spieler1 or sp.name = kontra.spieler2 or sp.name = kontra.spieler3)
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
        gruppe = 1
),
today as (
    select S.Plus_Re_Solo + S.Plus_Re + S.Plus_Kontra - S.Minus_Re_Solo - S.Minus_Re  - S.Minus_Kontra as today, S.spieler
    from Summanden S
)`

module.exports = {
    getSpieler: function(gruppe) {
        return getTODAY + `
            select today, gT.name, punkte, solo_countdown, bild
            from getToday gT, spieler s, gruppenmitglieder gm
            where gruppe = ` + gruppe + ` 
            and s.name = gm.spieler
            and s.name = gT.name;`
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
    delete_last: `
        select spiel.re into tempR from spiel order by id desc limit 1;
        select spiel.kontra into tempK from spiel order by id desc limit 1;
        Delete from spiel where id = (select id from spiel order by id desc limit 1);
        Delete from re where re.id = (select * from tempR);
        Delete from kontra where kontra.id = (select * from tempK);
        Drop table tempK;
        Drop table tempR;`,
    delete_spiel: function(id) {
        return `
            select spiel.re into tempR from spiel where id = ` + id + `;
            select spiel.kontra into tempK from spiel where id = ` + id + `;
            Delete from spiel where id = (select id from spiel order by id desc limit 1);
            Delete from re where re.id = (select * from tempR);
            Delete from kontra where kontra.id = (select * from tempK);
            Drop table tempK;
            Drop table tempR;`
    },
    update_spieler: function(gruppe) {
        return today + total + `
            select today.today as today, total.total as total from total, today where total.spieler = today.spieler;`


    }
}