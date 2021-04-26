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

module.exports = {
    getSpieler: function(gruppe){
        return getTODAY + `
            select today, gT.name, punkte, solo_countdown, bild
            from getToday gT, spieler s, gruppenmitglieder gm
            where gruppe = ` + gruppe + ` 
            and s.name = gm.spieler
            and s.name = gT.name;`    
    },
    insertResponse:function(kontra_spieler1, kontra_spieler2, kontra_spieler3, re_spieler1, re_spieler2, gruppe){
        return getTODAY + `
            select gT.name, solo_countdown, punkte, today
            from gruppenmitglieder gm, spieler sp, getTODAY gT
            where gm.spieler = sp.name
            and gruppe = ` + gruppe + `
            and gT.name = sp.name
            and sp.name in (` + kontra_spieler1 + ", " + kontra_spieler2 + ", " + kontra_spieler3 + ", " + re_spieler1 + ", " + re_spieler2 +`);`
    },
    delete_last:`
        select spiel.re into tempR from spiel order by id desc limit 1;
        select spiel.kontra into tempK from spiel order by id desc limit 1;
        Delete from spiel where id = (select id from spiel order by id desc limit 1);
        Delete from re where re.id = (select * from tempR);
        Delete from kontra where kontra.id = (select * from tempK);
        Drop table tempK;
        Drop table tempR;`
        ,
    delete_spiel: function(id){
        return `
            select spiel.re into tempR from spiel where id = ` + id +`;
            select spiel.kontra into tempK from spiel where id = ` + id +`;
            Delete from spiel where id = (select id from spiel order by id desc limit 1);
            Delete from re where re.id = (select * from tempR);
            Delete from kontra where kontra.id = (select * from tempK);
            Drop table tempK;
            Drop table tempR;`
    }
}