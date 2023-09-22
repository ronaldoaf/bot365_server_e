$.get('/user/filter_match_list_by_esoccer/esoccer_only');


function getJogos(data, page=1){
    
    function ajustaHandicap(str){
        var arr=str.split(',');
        if (arr.length==1) arr[1]=arr[0];
        return (Number(arr[0])+ Number(arr[1]))/2.0;
        
    }
    var obj=[];
    $.get('/match/schedule/'+data+'/page:'+page, function(res){ 
        var data_inicio=$(res).find('h3 small').text();
        $(res).find('tr[data-match_id]:contains(Esoccer):contains(Full)').each(function(){ 
        
            try{
                //if($(this).find('td:eq(1)').text().includes('mins play')) return;
                
                var id=$(this).attr('data-match_id');
                var tipo=/[0-9]+ m/.exec($(this).find('.td_league a').text())[0].replace(' ','');
                var data_hora=data_inicio+' '+$(this).find('td:eq(2)').text();
                var home=/\((.*)\)/.exec( $(this).find('.match_home a').text()  )[1]; 
                var away=/\((.*)\)/.exec( $(this).find('.match_away a').text()  )[1]; 
                var placar=$(this).find('.match_goal').text().split(' - ');
                var goal=$(this).find('.match_total_goal_div').text();
                var hand=$(this).find('.match_handicap').text();
                var corner=$(this).find('.span_match_corner').text().split(' - ');
                            var shoot=$(this).find('.match_shoot_div').text().split(' - ');
                var da=$(this).find('.match_dangerous_attacks_div').text().split(' - ');

                var red=[ $(this).find('.red_card:eq(0)').text(),  $(this).find('.red_card:eq(1)').text()];
                
                if(goal=='\n') return;
                if(hand=='\n') return;
                


            
                
                obj.push({
                    id: Number(id),
                    tipo: tipo,
                    data_inicio: data_hora, 
                    home: home,
                    away: away,
                    goal: ajustaHandicap(goal),
                    hand: ajustaHandicap(hand),
                    gh: Number(placar[0]),
                    ga: Number(placar[1]),
                    
                    ch: Number(corner[0]),
                    ca: Number(corner[1]),
                    
                    sh: Number(shoot[0]),
                    sa: Number(shoot[1]),
                    
                    rh: Number(red[0]),
                    ra: Number(red[1]),    
                    
                    dah:Number(da[0]),
                    daa:Number(da[1]),
                });
            }
            catch(e) {
                return;
            }
        }); 
        
        if (obj==[]){
            data=data+'';
            data_hora+=data.slice(0,4)+'-'+data.slice(4,6)+'-'+data.slice(6,8);
            obj.push({
                id: 0, tipo: '',  data_inicio: data_hora, home: '0', away: '0',goal: 0, hand: 0,
                gh: 0, ga: 0,ch: 0, ca: 0, sh: 0, sa: 0, rh: 0, ra: 0, dah:0, daa:0,
            });
        } 
        
        console.log(obj);
        
        
        
        
        $.ajax({
            type: 'POST',
            url: 'https://bot-ao.com/half/insert_jogos_e.php',
            data: JSON.stringify (obj),
            success: function(res_insert) {
                console.log(res_insert)
            },
            contentType: "application/json",
            dataType: 'json'
        }); 
        
        
        var n_pages=$(res).find('a[rel="last"]').size()==0 ? 1 : Number($(res).find('a[rel="last"]').attr('href').split(':')[1]);
        if(page==1) for(p=2;p<=n_pages;p++) getJogos(data, p);
       

        
    }); 

}



function medias(){
	var data=[];
	
	$('tr[data-match_id]').each(function(){
		var minuto=$(this).find('.match_status_minutes').text();
		if(!['','0'].includes(minuto) ) return;
		
		var id=$(this).attr('data-match_id');
		var tipo=/[0-9]+ m/.exec($(this).find('.td_league a').text())[0].replace(' ','');
		var home=/\((.*)\)/.exec( $(this).find('.match_home a').text()  )[1]; 
		var away=/\((.*)\)/.exec( $(this).find('.match_away a').text()  )[1]; 
		
	
		data.push({
			id: Number(id),
			tipo:tipo,
			home: home,
			away: away
		});
	});
	
	 $.getScript('https://bot-ao.com/half/set_medias_e.php?data='+JSON.stringify(data));
}



function atualizaJogos(){
	const hoje = new Date();
	const ano = hoje.getFullYear();
	const mes = String(hoje.getMonth() + 1).padStart(2, '0'); // os meses são de 0 a 11, então adicionamos 1
	const dia = String(hoje.getDate()).padStart(2, '0');

	const data = `${ano}${mes}${dia}`;
    
	getJogos(data);
	
}

setInterval( ()=>{
	atualizaJogos();
	medias();
	setTimeout(_=>location.reload(), 10*1000);
},3*60*1000);










