/*-------------------------------- Массивы данных для таблиц --------------------------------------*/
var th_el_cons_data = new Array(
    '№','Потребители/нагрузки','Мощность, <br>Вт','Кол-во, шт.','Время работы, ч/сутки'
  );
var td_el_cons_data = new Array(
    'Холодильник',' Освещение','Телевизор','Электрочайник','Микроволновая печь',
    'Кондиционер','Утюг','Стиральная машина','Теплый пол, м'+"2".sup(),'Электроотопление',
    'Электроплита','Оборудование кухни','Компьютер','Бойлер','Пылесос',
    'Водяной насос','Подогрев бассейна','Другое'
  );
var equipment = new Array(
    'Аккумуляторная батарея GEL','Солнечная панель RISEN','Автономный инвертор JFY','Комплектующие'
  );
var totalCapacity=0, minTempText;
/*-------------------------------- Главная функция --------------------------------------*/
$(function(){
  create_selectBox();
  create_map();
  printGreenForm();
})


/*-------------------------------- Второстепенные функции --------------------------------------*/

/* Построение карты Украины */
function create_map(){
    //Создаём холст и задаём цветовые параметры для будущих областей карты
  var userArea = ""; // храним область, выбранную пользователем

  var canvas = Raphael('map'),
  attributes = {
    fill: '#1E90FF',
    stroke: '#2E8B57',
    'stroke-width': 1,
    'stroke-linejoin': 'round'
  },

  scale = document.getElementsByTagName("svg")[0].setAttribute("viewBox", "20 -20 600 450"),
  checkedArea = '#006400';

// Добавляем на холст области, указанные в paths.js
  arr = new Array();
  for (var oblast in paths) {
    var obj = canvas.path(paths[oblast].path);
    obj.attr(attributes);
    arr[obj.id] = oblast;

    if(paths[arr[obj.id]].name=="Запорожская") {
      userArea=obj;
      $("#oblast").val(paths[arr[obj.id]].name);
      userArea.attr("fill","#1E90FF");
      obj.animate({
        fill: checkedArea
      },150);
    }

//При наведении на область меняем её цвет
    obj
    .hover(function(e){
      if(this.attr("fill")!=checkedArea){ // Если область не выбрана пользователем как раcсчётная
      this.animate({
        fill: '#1874CD'
      },150); 
      }

      var point = this.getBBox(0);
      $('#map').next('.point').remove();
      $('#map').after($('<div />').addClass('point'));
      $('.point')
      .html(paths[arr[this.id]].name)
      .css({
        left: e.offsetX==undefined?e.layerX:e.offsetX,
        top: e.offsetY==undefined?e.layerY:e.offsetY+50
      })
      .fadeIn();

      
    }, function(){
      if(this.attr("fill")!=checkedArea){ // Если область не выбрана пользователем как расcчётная
       this.animate({
        fill: attributes.fill
      },150);
      $('#map').next('.point').remove(); 
     } 
    })

//При нажатии на область меняем её цвет
    .click(function(){
      if(userArea!="") { userArea.attr("fill","#1E90FF"); }
       userArea=this;
       $("#oblast").val(paths[arr[this.id]].name);
       this.animate({
        fill: checkedArea
      },150);

      if($("#ph_station").text()=="Зелёный тариф") createGreenChart();
    });
  }
}


/* Построение таблицы "Электрические потребители" */
function create_dataTable(){

var header, row, cell, cell1, cell2, cell3, cell4, cell5, i;
 
    table = document.getElementById("dataTable");
    header = table.createTHead();
      row = header.insertRow(0); 
      cell = row.insertCell(0);
      cell.innerHTML = "Электрические потребители";
      table.rows[0].cells[0].colSpan = 5;

      row = header.insertRow(1);

      for(i=0; i<th_el_cons_data.length; i++){    
      cell = row.insertCell(i);
      cell.innerHTML = th_el_cons_data[i];
    }

    for(i=0; i<td_el_cons_data.length; i++){
        row = table.insertRow(i+2);
        cell1 = row.insertCell(0);
        cell2 = row.insertCell(1);
        cell3 = row.insertCell(2);
        cell4 = row.insertCell(3);
        cell5 = row.insertCell(4);

        cell1.innerHTML = (i+1)+'.';
        cell2.innerHTML = td_el_cons_data[i];
        cell3.innerHTML = '<input id="power' +i+'" type="text" value="0"/>';
        cell4.innerHTML = '<input id="amount'+i+'" type="text" value="0"/>'; 
        cell5.innerHTML = '<input id="hours' +i+'" type="text" value="0"/>'; 
    }
}

/* Построение таблицы "Комплектация СЭС" */
function create_calcTable(){
  table = document.getElementById("calcTable");
  header = table.createTHead();
  row = header.insertRow(0); 
  cell = row.insertCell(0);
  cell.innerHTML = "Комплектация СЭС";
  table.rows[0].cells[0].colSpan = 4;

for(i=0; i<equipment.length; i++){
    row = table.insertRow(i+1);
    cell1 = row.insertCell(0);    
    cell2 = row.insertCell(1);
    cell3 = row.insertCell(2);
    cell4 = row.insertCell(3); 

    
    cell2.id="equipType"+i; cell2.innerHTML = equipment[i];

    if(i<equipment.length-1) {
    cell3.innerHTML = '<input id="equipAmount'+i+'" type="text" value="0" readonly=""/>';
    cell4.innerHTML = 'шт.'; }
  }
  table.rows[equipment.length].cells[1].colSpan=3;
}

/* Создание списков выбора станции, мин. температуры и дней */
function create_selectBox(){  
    var chosenStation="";

    $('.select').on('click','.placeholder',function(){
    var parent = $(this).closest('.select');
    if ( ! parent.hasClass('is-open')){
      parent.addClass('is-open');
      $('.select.is-open').not(parent).removeClass('is-open');
    }else{
      parent.removeClass('is-open');
    }
  }).on('click','ul>li',function(){
    var parent = $(this).closest('.select');

        chosenStation=$(this).text(); 

        parent.removeClass('is-open').find('.placeholder').text($(this).text() );
        parent.find('input[type=hidden]').attr('value', $(this).attr('data-value'));

        if(chosenStation=="Зелёный тариф" )     { $(this).text("Автономная станция"); printGreenForm();  } 
        if(chosenStation=="Автономная станция" ) { $(this).text("Зелёный тариф"); printAutoForm(); }
  });
}

function create_autoSelectBox(){  
    var prefix="";

    $('.autoselect').on('click','.placeholder',function(){
    var parent = $(this).closest('.autoselect');
    if ( ! parent.hasClass('is-open')){
      parent.addClass('is-open');
      $('.autoselect.is-open').not(parent).removeClass('is-open');
    }else{
      parent.removeClass('is-open');
    }
  }).on('click','ul>li',function(){
    
    var parent = $(this).closest('.autoselect');

    if($(this).closest('.autoselect').find('.placeholder').attr("id")=="ph_days")    prefix="Дней автономной работы (при пасмурной погоде): ";
    if($(this).closest('.autoselect').find('.placeholder').attr("id")=="ph_minTemp") { prefix="Минимальная температура в помещении: "; minTempText=$(this).text(); }

    if(prefix=="Дней автономной работы (при пасмурной погоде): ") {
        parent.removeClass('is-open').find('.placeholder').text(prefix+$(this).text() );
        parent.find('input[type=hidden]').attr('value', $(this).attr('data-value'));
        getTotalCapacity();
    }
    if(prefix=="Дней автономной работы (при пасмурной погоде): " || prefix=="Минимальная температура в помещении: ") {
      parent.removeClass('is-open').find('.placeholder').text(prefix+$(this).text() );
      parent.find('input[type=hidden]').attr('value', $(this).attr('data-value'));
        getTotalCapacity();
    }
  });
}

/* Защита от некорректного формата юзверя */
function correction(){
  for (var j=0; j<td_el_cons_data.length; j++) {  
    $("#"+"power"+j).val(($("#"+"power"+j).val()).replace(",", "."));
    $("#"+"amount"+j).val(($("#"+"amount"+j).val()).replace(",", "."));
    $("#"+"hours"+j).val(($("#"+"hours"+j).val()).replace(",", "."));
  }
}

/* Общая мощность */
function getTotalCapacity(){
  totalCapacity=0;
  for (var j=0; j<td_el_cons_data.length; j++) 
    if( ($("#"+"power"+j).val()!='') &  ($("#"+"amount"+j).val()!='') & ($("#"+"hours"+j).val()!='')) 
      totalCapacity+=parseInt($("#"+"power"+j).val())*parseInt($("#"+"amount"+j).val())*parseInt($("#"+"hours"+j).val());

  $("#totalCapacity").val(totalCapacity*parseInt($("#days").val()));

  getEquipment();
}

/* Рассчитать комплектацию */
function getEquipment(){

  var buf=0, inv=0;
  for (var j=0; j<td_el_cons_data.length; j++) {
    correction();
    buf+=parseFloat($("#"+"power"+j).val())*parseFloat($("#"+"amount"+j).val())*parseFloat($("#"+"hours"+j).val());
  }
  
  var battery_capacity=1.25/(0.7*12)*buf*parseFloat($("#minTemp").val())*parseFloat($("#days").val()),
    result=Math.ceil(12*1.3*battery_capacity/(0.9*5*250));

  if (battery_capacity>0) {
    if (result<=5)                inv=1;
    if (result>5 && result<=11)   inv=2;
    if (result>11 && result<=23)  inv=3;
    if (result>23)                inv=4; 

  if(inv!=4) {
    $("#equipAmount1").val(result); // является общим для всех switch-case, кроме inv 4, что учтено ниже
    if($('#equipAmount1').val()>1)
      $("#equipType1").html("<a href='http://www.artenergy.com.ua/shop/product/solnechnaia-panel-risen-syp250s-250w-poli' target='_blank'>Солнечные панели Risen SYP250P 250Вт (Poly)</a> общей площадью "+(1.7*$('#equipAmount1').val()).toFixed(2)+" м"+"2".sup());
    else 
      $("#equipType1").html("<a href='http://www.artenergy.com.ua/shop/product/solnechnaia-panel-risen-syp250s-250w-poli' target='_blank'>Солнечная панель Risen SYP250P 250Вт (Poly)</a> площадью 1.7 м"+"2".sup());
    $("#equipAmount2").val(1); 
    $("#equipType3").html("Комплектующие: <a href='http://www.artenergy.com.ua/shop/product/konnektory-mc4-mama-papa' target='_blank'>коннекторы MC4</a>, <a href='http://www.artenergy.com.ua/shop/product/solnechnyi-kabel-4-mm2-tuv-anti-uv-chernyi' target='_blank'>провод для солнечных систем</a>, защита по стороне DC");

    switch(inv){ // #equipType0 - акк. батарея, #equipType1 - сол. панель, #equipType2 - инвертор
      case 1: $("#equipType2").html("Автономный инвертор XPI-1.0KVA-UML"); 
              
              if (battery_capacity<=200) {
                $("#equipAmount0").val(2);
                $("#equipType0").html("<a href='http://www.artenergy.com.ua/shop/product/akkumuliatornaia-batareia-altek-6fm100gel' target='_blank'>Аккумуляторная батарея Altek 6FM100GEL</a>");
              }
              if (battery_capacity>200 && battery_capacity<=300) {
                $("#equipAmount0").val(2);
                $("#equipType0").html("<a href='http://www.artenergy.com.ua/shop/product/akkumuliatornaia-batareia-altek-6fm150gel' target='_blank'>Аккумуляторная батарея Altek 6FM150GEL</a>");
              }
              if (battery_capacity>300 && battery_capacity<=400) {
                $("#equipAmount0").val(2);
                $("#equipType0").html("<a href='http://www.artenergy.com.ua/shop/product/akkumuliatornaia-batareia-altek-6fm200gel' target='_blank'>Аккумуляторная батарея Altek 6FM200GEL</a>");
              }
              if (battery_capacity>400) {
                $("#equipAmount0").val(4);
                $("#equipType0").html("<a href='http://www.artenergy.c<a href='http://www.artenergy.com.ua/shop/product/akkumuliator-gelevyi-lp-gl-12-120-ah' target='_blank'>Аккумуляторная батарея LP-GL 12 - 120 AH</a>");
              }
      break;
      
      case 2: $("#equipType2").html("<a href='http://www.artenergy.com.ua/shop/product/avtonomnyi-invertor-modeli-xpi-15kva-uml-proizvodstva-jfy-moshchnostiu-1000-vt' target='_blank'>Автономный инвертор XPI-1.5KVA-UML</a>");
             
              if (battery_capacity<=480) {
                $("#equipAmount0").val(4);
                $("#equipType0").html("<a href='http://www.artenergy.com.ua/shop/product/akkumuliator-gelevyi-lp-gl-12-120-ah' target='_blank'>Аккумуляторная батарея LP-GL 12 - 120 AH</a>");
              }
              if (battery_capacity>480 && battery_capacity<=600) {
                $("#equipAmount0").val(4);
                $("#equipType0").html("<a href='http://www.artenergy.com.ua/shop/product/akkumuliatornaia-batareia-altek-6fm150gel' target='_blank'>Аккумуляторная батарея Altek 6FM150GEL</a>");
              }
              if (battery_capacity>600 && battery_capacity<=800) {
                $("#equipAmount0").val(4);
                $("#equipType0").html("<a href='http://www.artenergy.com.ua/shop/product/akkumuliatornaia-batareia-altek-6fm200gel' target='_blank'>Аккумуляторная батарея Altek 6FM200GEL</a>");
              }
              if (battery_capacity>800) {
                $("#equipAmount0").val(8);
                $("#equipType0").html("<a href='http://www.artenergy.com.ua/shop/product/akkumuliator-gelevyi-lp-gl-12-120-ah' target='_blank'>Аккумуляторная батарея LP-GL 12 - 120 AH</a>");
                
              }
      break;

      case 3: $("#equipType2").html("<a href='http://www.artenergy.com.ua/shop/product/avtonomnyi-invertor-modeli-xpi-40kva-uml-proizvodstva-jfy-moshchnostiu-3000-vt' target='_blank'>Автономный инвертор XPI-4.0KVA-UML</a> или <a href='http://www.artenergy.com.ua/shop/product/avtonomnyi-invertor-modeli-xpi-70kva-uml-proizvodstva-jfy-moshchnostiu-5000-vt' target='_blank'>Автономный инвертор XPI-7.0KVA-UML</a>");

              if (battery_capacity<=960) {
                $("#equipAmount0").val(8);
                $("#equipType0").html("<a href='http://www.artenergy.com.ua/shop/product/akkumuliator-gelevyi-lp-gl-12-120-ah' target='_blank'>Аккумуляторная батарея LP-GL 12 - 120 AH</a>");
              }
              if (battery_capacity>960 && battery_capacity<=1200) {
                $("#equipAmount0").val(8);
                $("#equipType0").html("<a href='http://www.artenergy.com.ua/shop/product/akkumuliatornaia-batareia-altek-6fm150gel' target='_blank'>Аккумуляторная батарея Altek 6FM150GEL</a>");
              }
              if (battery_capacity>1200 && battery_capacity<=1600) {
                $("#equipAmount0").val(8);
                $("#equipType0").html("<a href='http://www.artenergy.com.ua/shop/product/akkumuliatornaia-batareia-altek-6fm200gel' target='_blank'>Аккумуляторная батарея Altek 6FM200GEL</a>");
              }
              if (battery_capacity>1600) {
                $("#equipAmount0").val(16);
                $("#equipType0").html("<a href='http://www.artenergy.com.ua/shop/product/akkumuliator-gelevyi-lp-gl-12-120-ah' target='_blank'>Аккумуляторная батарея LP-GL 12 - 120 AH</a>");
              }          
      break;
    }
  }
}
}

/* Вывод основных блоков при выборе автономного калькулятора */
function printAutoForm(){
  
  var a='<div class="divMiddle"><table onkeyup="getTotalCapacity()" id="dataTable"></table>Суммарная мощность <input type="text" readonly="" id="totalCapacity" value="0"/> Вт</div><table id="addParamTable"><tr><td>',
      b='<div class="autoselect"><span class="placeholder" id="ph_minTemp" style="width:360px">Минимальная температура в помещении: выше 26 (&deg;C)</span><ul><li id="temperature" data-value="1">выше 26 (&deg;C)</li><li data-value="1.04">от 21 до 26 (&deg;C)</li><li data-value="1.11">от 16 до 21 (&deg;C)</li><li data-value="1.19">от 10 до 16 (&deg;C)</li><li data-value="1.3">от 4 до 10 (&deg;C)</li><li data-value="1.4">от -1 до 4 (&deg;C)</li><li data-value="1.59">от -7 до -1 (&deg;C)</li></ul><input type="hidden" id="minTemp" value="1"/></div></td></tr>',
      c='<tr><td><div class="autoselect"><span class="placeholder" id="ph_days" style="width:360px">Дней автономной работы (при пасмурной погоде): 1</span><ul><li data-value="1">1</li><li data-value="2">2</li><li data-value="3">3</li><li data-value="4">4</li><li data-value="5">5</li><li data-value="6">6</li></ul><input type="hidden" id="days" value="1"/></div></td></tr></table>',
      d='<div id="calcTableDiv"><table id="calcTable"></table></div><div id="divBot"><a href="#" class="a_demo_one" onclick="showEmailDiv()">Отправить расчёты на почту</a></div>';

  $("#calculatorDiv").html(a+b+c+d);
  create_dataTable();
  create_calcTable();
  create_autoSelectBox();
  hideEmailDiv();

  minTempText=$('#temperature').text();;
}


/************************ GREEEN ******************** GREEEN *********************** GREEEN *********************/
/************************ GREEEN ******************** GREEEN *********************** GREEEN *********************/
/************************ GREEEN ******************** GREEEN *********************** GREEEN *********************/
/************************ GREEEN ******************** GREEEN *********************** GREEEN *********************/
/************************ GREEEN ******************** GREEEN *********************** GREEEN *********************/

/************************* Основные массивы данных для расчётов по зелёному тарифу *************************/
  var oblastCoefficient = {
      'Днепропетровская' : [1.48, 2.4, 3.48, 4.36, 5.1, 4.84, 4.75, 4.99, 3.93, 3.13, 1.53, 1.2],
      'Черниговская'     : [1.3, 2.06, 3.56, 4.29, 5.03, 4.91, 4.72, 4.42, 3.51, 2.52, 1.2, 0.89],
      'Суммская'         : [1.57, 2.65, 3.67, 4.11, 5.3, 4.99, 4.68, 4.63, 3.59, 2.81, 1.4, 1.06],
      'Донецкая'         : [1.54, 2.57, 3.5, 4.34, 4.92, 4.81, 4.73, 5.1, 3.8, 2.92, 1.57, 1.01],
      'Луганская'        : [1.77, 2.44, 3.46, 4.37, 4.9, 4.76, 4.56, 4.96, 3.58, 2.82, 1.08, 0.91],
      'Харьковская'      : [1.68, 2.86, 3.73, 4.13, 5.28, 4.94, 4.67, 4.7, 3.64, 2.82, 1.6, 1.19],
      'Киевская'         : [1.31, 2.05, 3.27, 4.08, 4.9, 4.78, 4.62, 4.46, 3.38, 2.59, 1.24, 0.79],
      'Львовская'        : [1.29, 1.57, 2.75, 3.96, 4.05, 4.4, 4.26, 3.73, 3.36, 2.44, 1.18, 0.89],
      'Тернопольская'    : [1.06, 1.53, 2.94, 4.08, 4.25, 4.52, 4.46, 3.71, 3.4, 2.45, 1.33, 0.74],
      'Хмельницкая'      : [1.04, 1.51, 2.97, 4.05, 4.44, 4.77, 4.59, 3.99, 3.56, 2.55, 1.34, 0.51],
      'Николаевская'     : [1.49, 2.55, 3.48, 4.43, 5.1, 4.89, 4.92, 5.04, 4.08, 3.26, 1.51, 1.47],
      'Херсонская'       : [1.65, 2.65, 3.5, 4.38, 5.13, 4.91, 4.96, 5.19, 4.16, 3.26, 1.63, 1.47],
      'Одесская'         : [1.16, 2.04, 3.03, 4.29, 4.82, 4.99, 4.89, 4.74, 3.91, 2.98, 1.32, 1.01],
      'Полтавская'       : [1.43, 2.73, 3.37, 4.15, 5.36, 5.03, 4.75, 4.75, 3.77, 2.96, 1.53, 1.29],
      'Черкасская'       : [1.41, 2.43, 3.31, 4.22, 5.13, 4.89, 4.8, 4.73, 3.65, 3, 1.43, 1.02],
      'Кировоградская'   : [1.28, 2.37, 3.37, 4.19, 5.22, 4.85, 4.91, 4.83, 3.85, 3.07, 1.55, 1.23],
      'АР Крым'          : [2.31, 3.11, 3.67, 4.6, 4.95, 5.03, 5.27, 4.79, 4.49, 3.47, 2.49, 1.83],
      'Закарпатская'     : [1.18, 1.81, 2.98, 4.33, 4.46, 4.62, 4.5, 3.93, 3.66, 2.64, 1.29, 0.75],
      'Ивано-Франковская': [1.44, 1.76, 2.82, 4.13, 4.18, 4.13, 4.25, 3.61, 3.28, 2.47, 1.22, 0.96],
      'Черновецкая'      : [1.25, 1.97, 3.1, 4.05, 4.41, 4.45, 4.52, 3.82, 3.48, 2.61, 1.32, 0.95],
      'Винницкая'        : [1.09, 1.53, 2.81, 4.11, 4.69, 4.75, 4.64, 4.24, 3.71, 2.61, 1.17, 0.72],
      'Запорожская'      : [1.47, 2.44, 3.39, 4.33, 5.06, 4.79, 4.8, 5.11, 3.83, 2.94, 1.45, 1.18],
      'Житомирская'      : [1.09, 1.6, 3.02, 4.22, 4.58, 4.71, 4.69, 4.26, 3.48, 2.57, 1.09, 0.78],
      'Волынская'        : [1.21, 1.53, 2.97, 4.25, 4.32, 4.64, 4.52, 3.97, 3.29, 2.36, 1.3, 0.69],
      'Ровенская'        : [0.98, 1.42, 2.98, 4.38, 4.23, 4.68, 4.51, 4.02, 3.34, 2.32, 1.18, 0.67],       
    };
    var angleСoefficient = {
    '0' : [0.491708292, 0.633861955, 0.739406974, 0.877660383, 0.998204711, 1.044998846, 1.02076231, 0.936398889, 0.793120515, 0.665454462, 0.535893574, 0.48989992],
    '5' : [0.581152181, 0.701604595, 0.793424517, 0.912691294, 1.015215776, 1.056103299, 1.034929486, 0.962499646, 0.839608754, 0.730884909, 0.619728916, 0.581445324],
    '10': [0.664585415, 0.765312334, 0.84331277, 0.942051789, 1.027208466, 1.061170654, 1.044131718, 0.983206435, 0.88244532, 0.789465258, 0.697389558, 0.661754774],
    '15': [0.745854146, 0.823377455, 0.886262744, 0.965741867, 1.033204812, 1.060200913, 1.047309684, 0.997388035, 0.917667625, 0.843179635, 0.771034137, 0.74494996],
    '20': [0.815101565, 0.877407673, 0.923678933, 0.983918618, 1.033172681, 1.054212404, 1.042455295, 1.008350731, 0.947813755, 0.892028041, 0.838504016, 0.817062688],
    '25': [0.886030636, 0.924187557, 0.955561339, 0.995259451, 1.02712814, 1.040150138, 1.034644052, 1.010613174, 0.971770125, 0.934026348, 0.897791165, 0.883557438],
    '30': [0.947102897, 0.966932538, 0.980547561, 1.001008412, 1.016065225, 1.022087435, 1.020808542, 1.009656713, 0.98842315, 0.969717762, 0.955070281, 0.947319948],
    '35': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    '40': [1.050732601, 1.02903256, 1.01251416, 0.994486673, 0.976912264, 0.970881432, 0.975175281, 0.987124382, 1.005076174, 1.021991217, 1.040913655, 1.049947811],
    '45': [1.087279387, 1.0483876, 1.018132137, 0.982215972, 0.949832319, 0.937738133, 0.943488084, 0.966592354, 1.004273504, 1.039116463, 1.073644578, 1.091545404],
    '50': [1.121661672, 1.066134923, 1.018174234, 0.9643534, 0.916739964, 0.898533443, 0.907674155, 0.940666358, 0.996970158, 1.049391611, 1.10436747, 1.122060539],
    '55': [1.144022644, 1.071777542, 1.011320148, 0.939733455, 0.878629235, 0.855304021, 0.86583596, 0.910390236, 0.983477053, 1.051375738, 1.122740964, 1.144225456],
    '60': [1.162054612, 1.072597009, 0.99756988, 0.909443093, 0.833528124, 0.805043466, 0.817973499, 0.873588925, 0.963794187, 1.048493893, 1.130923695, 1.160925892],
    '65': [1.17022977, 1.066954391, 0.978285828, 0.874647816, 0.786390746, 0.754782911, 0.769162271, 0.832437488, 0.93792156, 1.037321028, 1.137098394, 1.17200835],
    '70': [1.174075924, 1.055669154, 0.953425895, 0.833095166, 0.736255196, 0.701515955, 0.716334866, 0.788067146, 0.90697276, 1.020738987, 1.135090361, 1.174894087],
    '75': [1.163736264, 1.034706397, 0.921669779, 0.788203101, 0.681117336, 0.643205937, 0.658542518, 0.737171615, 0.868409698, 0.997850053, 1.120732932, 1.172161847],
    '80': [1.147385947, 1.008101021, 0.882975385, 0.737719165, 0.622981304, 0.581865224, 0.597793314, 0.684101021, 0.826194963, 0.96811102, 1.10436747, 1.158347148],
    '85': [1.126706627, 0.977460744, 0.840151701, 0.68381727, 0.562841135, 0.517493815, 0.534925466, 0.62563646, 0.77921497, 0.932065093, 1.081977912, 1.133449991],
    '90': [1.10001665, 0.939570131, 0.791794232, 0.627662917, 0.50170693, 0.458165467, 0.471947062, 0.567171898, 0.728272388, 0.892050913, 1.049246988, 1.108552834],
    };

    var annualOutputVar=0, result=0;
/*END        ************************* Основные массивы данных для расчётов по зелёному тарифу *************************        END*/ 

/* Вывод основных блоков при выборе калькулятора зелёного тарифа */
function printGreenForm(){
  var a='<div id="greenMainParams"><table id="greenTableParam"></table></div>',
      b='<div id="greenChartDiv"></div>',
      c='<div id="greenCalcValues"><table id="greenTableCalc"></table></div>',
      d='<div id="divBot"><a href="#" class="a_demo_one" onclick="showEmailDiv()">Отправить расчёты на почту</a></div>';

  $("#calculatorDiv").html(a+b+c+d);
  printGreenParams();
  createGreenChart();
  hideEmailDiv();
}

function printGreenParams(){
  var greenCell1Array = new Array("Мощность фотомодулей, кВт","Угол наклона, град."),
      greenCell2Array = new Array("<div id='powerSlider'></div>","<div id='angleSlider'></div>");

  table = document.getElementById("greenTableParam");

  for(i=0; i<greenCell1Array.length; i++){
    row = table.insertRow(i);
    cell1 = row.insertCell(0);    
    cell2 = row.insertCell(1);
      
    cell1.innerHTML = greenCell1Array[i];
    cell2.innerHTML = greenCell2Array[i];
  }

  var greenCellArray = new Array("Площадь фотомодулей <input id='square' readonly='' /> м"+"2".sup(), 
                                 "Выработка за год <input id='production' readonly='' /> кВт&#215;ч",
                                 "Стоимость станции <input id='cost' readonly='' /> &#8364;");

  table = document.getElementById("greenTableCalc")
  row = table.insertRow(0);

  for(i=0; i<greenCellArray.length; i++){
    cell = row.insertCell(i);    
    cell.innerHTML = greenCellArray[i];
  }

  $("#angleSlider").freshslider({
                        step: 5,
                        value:0,
                        min:0,
                        max: 90,
                        onchange: function(event, ui) { createGreenChart(); }
                    });
  $("#powerSlider").freshslider({
                        step: 0.5,
                        value: 1.0,
                        min: 1.0,
                        max: 30.0,
                        onchange: function(event, ui) { createGreenChart(); }
                    });

}



function annualOutput(item, days){

  var powerSliderVal=$("#powerSlider").find('.fscaret').text(),
      angleSliderVal=$("#angleSlider").find('.fscaret').text(),
      oblastVal=$("#oblast").val(),
      losses=0, 

      squareVal=powerSliderVal*1000/250*1.7,
      costVal = Math.round(powerSliderVal*1000*1.25);
      $("#square").val(squareVal.toFixed(2));
      $("#cost").val(costVal);

      result=oblastCoefficient[oblastVal][item]*powerSliderVal*days*angleСoefficient[angleSliderVal][item]-
             oblastCoefficient[oblastVal][item]*powerSliderVal*days*angleСoefficient[angleSliderVal][item]*losses;
      annualOutputVar+=result;

  return result;
}

function createGreenChart(){
  annualOutputVar=0, result=0;

  CanvasJS.addColorSet("setBarsColor", ["#1E90FF","#1E90FF","#1E90FF","#1E90FF","#1E90FF","#1E90FF","#1E90FF","#1E90FF","#1E90FF","#1E90FF","#1E90FF","#1E90FF"]);

  var chart = new CanvasJS.Chart("greenChartDiv",{ 
      colorSet: "setBarsColor",
      axisX: {
        title:"Mесяц",
        titleFontSize: 12,
        titleFontColor:"#000",
        titleFontFamily: "Tahoma, Geneva, Kalimati, sans-serif",
        labelFontColor: "#006400",
        labelFontSize: 11,
        interval: 1
      },  
      axisY:{
        title:"кВт*ч",
        titleFontColor:"#000",
        titleFontSize: 12,
        titleFontFamily: "Tahoma, Geneva, Kalimati, sans-serif",
        labelFontColor: "#006400",
        labelFontSize: 11,
        gridThickness: 1
       }, 
      toolTip:{
        fontSize: 12,
        fontColor: "#000",
        fontFamily: "Tahoma, Geneva, Kalimati, sans-serif",
        fontStyle: "normal",
        borderThickness: 1,
        borderColor: "#000"
      },
      legend:{
        fontSize: 12,
        fontColor: "#000",
        fontFamily: "Tahoma, Geneva, Kalimati, sans-serif",
        horizontalAlign: "right",  
        verticalAlign: "top"  
      },
      data: [
      {        
        type: "column",
        showInLegend: true, 
        legendText: "Выработка станции",
        dataPoints: [
        { x: 1, y: annualOutput(0,31) },
        { x: 2, y: annualOutput(1,28) },
        { x: 3, y: annualOutput(2,31) },
        { x: 4, y: annualOutput(3,30) },
        { x: 5, y: annualOutput(4,31) },
        { x: 6, y: annualOutput(5,30) },
        { x: 7, y: annualOutput(6,31) },
        { x: 8, y: annualOutput(7,31) },
        { x: 9, y: annualOutput(8,30) },
        { x: 10, y: annualOutput(9,31) },
        { x: 11, y: annualOutput(10,30) },
        { x: 12, y: annualOutput(11,31) },
        ]
      }        
      ]
    });

    chart.render();
  $("#production").val((annualOutputVar).toFixed(0));
  }



  /*****  ПЕРЕДАЧА ДАННЫХ НА СЕРВЕР!!!  *****  ПЕРЕДАЧА ДАННЫХ НА СЕРВЕР!!!  *****  ПЕРЕДАЧА ДАННЫХ НА СЕРВЕР!!!  *****/

  function showEmailDiv(){
    var fill='Email <input id="userEmailField" /><div class="buttonHolder"><a href="#" class="button tick" onclick="sendData()"></a></div><div class="buttonHolder"><a href="#" class="button cross" onclick="hideEmailDiv()"></a></div>';

    $("#userEmail").html(fill);

    $("#screenLayerDiv").show();
    $("#userEmail").show();
  }

  function hideEmailDiv(){
    $("#userEmail").hide();   
    $("#screenLayerDiv").hide(); 
  }

  function sendData(){

  var filter = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/, userData;
            
    if (!filter.test($("#userEmailField").val())) swal({ title: "Ошибка!", text: "Неверный формат адреса",  type: "error" });
    else {

    switch($("#ph_station").text()){
      case 'Автономная станция':    
        userData = { 'oblast'  : $("#oblast").val(),
                     'power'   : $("#totalCapacity").val(),
                     'minTemp' : minTempText,
                     'days'    : $("#days").val(),
                     'email'   : $("#userEmailField").val(),
                     'station' : $("#ph_station").text(),

                     'equipType0'   : $("#equipType0").text(),
                     'equipAmount0' : $("#equipAmount0").val(),
                     'equipType1'   : $("#equipType1").text(),
                     'equipAmount1' : $("#equipAmount1").val(),
                     'equipType2'   : $("#equipType2").text(),
                     'equipAmount2' : $("#equipAmount2").val(),
                     'equipType3'   : $("#equipType3").text()
                    };

        break;
      case 'Зелёный тариф': 
        userData = { 'oblast'  : $("#oblast").val(),
                     'power'   : $("#powerSlider").find('.fscaret').text(),
                     'angle'   : $("#angleSlider").find('.fscaret').text(),
                     'cost'    : $("#cost").val(),
                     'square'  : $("#square").val(),
                     'produc'  : $("#production").val(),
                     'email'   : $("#userEmailField").val(),
                     'station' : $("#ph_station").text()
                    };
        break;
    }

    $.ajax({
         type:'post',
         url:'/project/GetData.php', //url адрес php-скрипта, принимающего переменные
         data: userData,
         response:'text',      //тип возвращаемого ответа text либо xml
         success:function(data) {  //возвращаемый сервером результат
            //alert(data);
            swal({ title: "Спасибо!", text: "Результаты расчётов отправлены на указанный Вами электронный адрес", type: "success", timer: 3000 });
         },
         error: function(jqXHR, textStatus, errorThrown){
            swal({ title: "Ошибка!", text: "Произошёл сбой при отправке результатов", type: "error", timer: 3000 });
         }
    });

    hideEmailDiv();
    }

  }