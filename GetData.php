<?php

// Получение данных от клиента

 if(isset($_POST)){

  require_once('PHPExcel.php');
  require_once('PHPExcel/IOFactory.php');

  $document = 'Data.xlsx';

  date_default_timezone_set("Europe/Kiev"); 
  $date = date("d.m.y");
  $time = date("H:i");

  $adEmail="sales@artenergy.com.ua, ";  // Эл. адрес администратора

 	switch($_POST['station']){
 	  case 'Зелёный тариф':
		$oblast  = $_POST['oblast'];  
		$power 	 = $_POST['power']; 
		$angle	 = $_POST['angle']; 
		$square	 = $_POST['square']; 
		$cost	 = $_POST['cost']; 
		$produc	 = $_POST['produc']; 
		$email	 = $_POST['email'];
		$station = $_POST['station'];  

		if(!is_readable($document)) writeToTheNewDoc($document,$oblast,$power,$angle,$square,$date,$station); 
	    else writeToTheExistingDoc($document,$oblast,$power,$angle,$square,$date, $station);

		sendGreenMsg($adEmail, $email, $oblast,$power,$angle,$square,$produc,$cost, $date,$time);  		
	  break;

	  case 'Автономная станция': 
		$oblast  = $_POST['oblast'];  
		$power 	 = $_POST['power']; 
		$minTemp = $_POST['minTemp']; 
		$days 	 = $_POST['days']; 
		$email	 = $_POST['email'];
		$station = $_POST['station']; 	

		$equipType0   = $_POST['equipType0'];
		$equipAmount0 = $_POST['equipAmount0'];
		$equipType1   = $_POST['equipType1'];
		$equipAmount1 = $_POST['equipAmount1'];
		$equipType2   = $_POST['equipType2'];
		$equipAmount2 = $_POST['equipAmount2'];
		$equipType3   = $_POST['equipType3'];

		if(!is_readable($document)) writeToTheNewDoc($document,$oblast,$power,$minTemp,$days,$date,$station); 
	    else writeToTheExistingDoc($document,$oblast,$power,$minTemp,$days,$date, $station);

		sendAutoMsg($adEmail,$email, $oblast,$power,$minTemp,$days, $equipType0,$equipAmount0,$equipType1,$equipAmount1,$equipType2,$equipAmount2,$equipType3, $date,$time);  
	  break;
	}
}	

    function writeToTheNewDoc($document,$oblast,$power,$C,$D, $date, $station){

		$xlsx = new PHPExcel();			 

		$xlsx->setActiveSheetIndex(0);
		$xlsx->createSheet(1);
		$xlsx->createSheet(2);

		$sheet = $xlsx->getActiveSheet(); 
		$sheet->setTitle('Зелёный тариф'); 
		$sheet->setCellValue("A1", 'Таблица запросов на выработку по ЗТ');
		$sheet->setCellValue('C2', 'Угол');
		$sheet->setCellValue('D2', 'Площадь');
		$sheet->getStyle('A1')->getFill()->getStartColor()->setRGB('458B00');

		$xlsx->setActiveSheetIndex(1);
		$sheet=$xlsx->getActiveSheet()->setTitle('Автономная'); 
		$sheet->setCellValue("A1", 'Таблица параметров расчёта АС');
		$sheet->setCellValue('C2', 'Температура');
		$sheet->setCellValue('D2', 'Дни');
		$sheet->getStyle('A1')->getFill()->getStartColor()->setRGB('FFD700');

		$xlsx->setActiveSheetIndex(2);
		$sheet=$xlsx->getActiveSheet()->setTitle('Диаграмма');

		for($j=0; $j<2; $j++) {
			$xlsx->setActiveSheetIndex($j);
			$sheet= $xlsx->getActiveSheet();

			$sheet->getStyle('A1')->getFill()->setFillType(PHPExcel_Style_Fill::FILL_SOLID); 
			$sheet->getStyle('A1')->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_CENTER); 
			$sheet->mergeCells('A1:E1'); 

			for($i='A'; $i<'F'; $i++)  { 
				$sheet->getStyle($i.'2')->getFill()->setFillType(PHPExcel_Style_Fill::FILL_SOLID); 
				$sheet->getStyle($i.'2')->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_CENTER); 
				$sheet->getStyle($i.'2')->getFill()->getStartColor()->setRGB('B9D3EE');
			}

			for($i='A'; $i!=='E'; $i++) $sheet->getColumnDimension($i)->setAutoSize(true); // Выравнивание по содержимому

			$sheet->setCellValue('A2', 'Область');
			$sheet->setCellValue('B2', 'Мощность');			
			$sheet->setCellValue('E2', 'Дата');
		}

		if ($station=='Зелёный тариф') {
			$xlsx->setActiveSheetIndex(0);
			$sheet= $xlsx->getActiveSheet();
		}
		else {
			$xlsx->setActiveSheetIndex(1);
			$sheet= $xlsx->getActiveSheet();
		}

		$sheet->setCellValue('A3', $oblast);
		$sheet->setCellValue('B3', $power);
		$sheet->setCellValue('C3', $C);
		$sheet->setCellValue('D3', $D);
		$sheet->setCellValue('E3', $date);

		$objWriter = PHPExcel_IOFactory::createWriter($xlsx, 'Excel2007');
	 	$objWriter->save($document);
  }

  	function writeToTheExistingDoc($document,$oblast,$power,$C,$D,$date, $station){

  		$cacheMethod = PHPExcel_CachedObjectStorageFactory::cache_in_memory;
  		PHPExcel_Settings::setCacheStorageMethod($cacheMethod);

		$sheet = PHPExcel_IOFactory::createReader('Excel2007'); 
		$sheet->setIncludeCharts(true);
		$sheet = $sheet->load($document);

		if($station=='Зелёный тариф') $sheet->setActiveSheetIndex(0);
		else $sheet->setActiveSheetIndex(1);

		for($i='A'; $i!=='E'; $i++) $sheet->getActiveSheet()->getColumnDimension($i)->setAutoSize(true); // Выравнивание по содержимому

		$row = $sheet->getActiveSheet()->getHighestRow()+1;	
		$sheet->getActiveSheet()->setCellValueByColumnAndRow(0, $row, $oblast);
		$sheet->getActiveSheet()->setCellValueByColumnAndRow(1, $row, $power);
		$sheet->getActiveSheet()->setCellValueByColumnAndRow(2, $row, $C);
		$sheet->getActiveSheet()->setCellValueByColumnAndRow(3, $row, $D);
		$sheet->getActiveSheet()->setCellValueByColumnAndRow(4, $row, $date);

		createThirdSheet($sheet);	

		$objWriter = PHPExcel_IOFactory::createWriter($sheet, 'Excel2007');
		$objWriter->setIncludeCharts(TRUE);
		$objWriter->save(str_replace('.php', '.xlsx', $document));
  	}

  	function createThirdSheet($sheet){

		$xOblastA = array(); $yReqAmA = array(); $Auto = array();
		$xOblastG = array(); $yReqAmG = array(); $Green = array();

		$sheet->setActiveSheetIndex(0);
		if($sheet->getActiveSheet()->getHighestRow()>2) {
			for($i = 3; $i<= $sheet->getActiveSheet()->getHighestRow(); $i++) $Green[] = $sheet->getActiveSheet()->getCellByColumnAndRow(0, $i)->getValue();	
				
			$Green = array_count_values($Green); arsort($Green);
			foreach ($Green as $key => $value) { $xOblastG[] = $key; $yReqAmG[] = $value; }
		}
		$sheet->setActiveSheetIndex(1);
		if($sheet->getActiveSheet()->getHighestRow()>2) {
			for($i = 3; $i<= $sheet->getActiveSheet()->getHighestRow(); $i++) $Auto[] = $sheet->getActiveSheet()->getCellByColumnAndRow(0, $i)->getValue();	
				
			$Auto = array_count_values($Auto); arsort($Auto);
			foreach ($Auto as $key => $value) { $xOblastA[] = $key; $yReqAmA[] = $value; }
		}

		$sheet->removeSheetByIndex(2);
		$sheet->createSheet(2);
		$sheet->setActiveSheetIndex(2);

		$sheet->getActiveSheet()->setTitle('Диаграмма');
		for($i='A'; $i<'F'; $i++) $sheet->getActiveSheet()->getColumnDimension($i)->setAutoSize(true);

		$sheet->getActiveSheet()->getStyle('A1')->getFill()->getStartColor()->setRGB('458B00');
		$sheet->getActiveSheet()->getStyle('D1')->getFill()->getStartColor()->setRGB('FFD700');

		$sheet->getActiveSheet()->getStyle('A1')->getFill()->setFillType(PHPExcel_Style_Fill::FILL_SOLID); 
		$sheet->getActiveSheet()->getStyle('D1')->getFill()->setFillType(PHPExcel_Style_Fill::FILL_SOLID); 

		$sheet->getActiveSheet()->setCellValue('A1', 'ЗТ'); $sheet->getActiveSheet()->mergeCells('A1:B1'); 
		$sheet->getActiveSheet()->setCellValue("D1", 'АС'); $sheet->getActiveSheet()->mergeCells('D1:E1'); 

		for ($i='A'; $i<'F'; $i++)  if($i!=='C') {
				$sheet->getActiveSheet()->getStyle($i.'1')->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_CENTER); 
				$sheet->getActiveSheet()->getStyle($i.'2')->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_CENTER); 
				$sheet->getActiveSheet()->getStyle($i.'2')->getFill()->setFillType(PHPExcel_Style_Fill::FILL_SOLID); 
				$sheet->getActiveSheet()->getStyle($i.'2')->getFill()->getStartColor()->setRGB('B9D3EE');
			}

		$sheet->getActiveSheet()->setCellValue('A2', 'Область');
		$sheet->getActiveSheet()->setCellValue('B2', 'Запросы');
		$sheet->getActiveSheet()->setCellValue('D2', 'Область');
		$sheet->getActiveSheet()->setCellValue('E2', 'Запросы');

		for($i=0; $i<count($xOblastG); $i++) {
			$sheet->getActiveSheet()->setCellValueByColumnAndRow(0, ($i+3), $xOblastG[$i]);
			$sheet->getActiveSheet()->setCellValueByColumnAndRow(1, ($i+3), $yReqAmG[$i]);
		}

		for($i=0; $i<count($xOblastA); $i++) {
			$sheet->getActiveSheet()->setCellValueByColumnAndRow(3, ($i+3), $xOblastA[$i]);
			$sheet->getActiveSheet()->setCellValueByColumnAndRow(4, ($i+3), $yReqAmA[$i]);
		}

		if (count($xOblastG)>0) { $flag='G'; $sheet->getActiveSheet()->addChart(createChart($sheet,$xOblastG,$flag)); }
		if (count($xOblastA)>0) { $flag='A'; $sheet->getActiveSheet()->addChart(createChart($sheet,$xOblastA,$flag)); }

		$sheet->setActiveSheetIndex(0);
 	}

  	function createChart($sheet,$xOblast,$flag){

		$dataSeriesLabels = array(new PHPExcel_Chart_DataSeriesValues('String', 'Диаграмма!$B$1', NULL, 1));
		
		if($flag=='G') {
			$xAxisTickValues  = array(new PHPExcel_Chart_DataSeriesValues('String', 'Диаграмма!$A$3:$A$'.($sheet->getActiveSheet()->getHighestRow()), NULL, count($xOblast)));
			$dataSeriesValues = array(new PHPExcel_Chart_DataSeriesValues('Number', 'Диаграмма!$B$3:$B$'.($sheet->getActiveSheet()->getHighestRow()), NULL, count($xOblast)));
			$title = new PHPExcel_Chart_Title('Запросы по областям (ЗТ)');
		}
		else {
			$xAxisTickValues  = array(new PHPExcel_Chart_DataSeriesValues('String', 'Диаграмма!$D$3:$D$'.($sheet->getActiveSheet()->getHighestRow()), NULL, count($xOblast)));
			$dataSeriesValues = array(new PHPExcel_Chart_DataSeriesValues('Number', 'Диаграмма!$E$3:$E$'.($sheet->getActiveSheet()->getHighestRow()), NULL, count($xOblast)));
			$title = new PHPExcel_Chart_Title('Запросы по областям (АС)');
		}

		$series = new PHPExcel_Chart_DataSeries(
					PHPExcel_Chart_DataSeries::TYPE_BARCHART,		// plotType
					PHPExcel_Chart_DataSeries::GROUPING_CLUSTERED,	// plotGrouping
					range(0, count($dataSeriesValues)-1),			// plotOrder
					$dataSeriesLabels,								// plotLabel
					$xAxisTickValues,								// plotCategory
					$dataSeriesValues								// plotValues
		);

		$series->setPlotDirection(PHPExcel_Chart_DataSeries::DIRECTION_COL);

		$plotArea = new PHPExcel_Chart_PlotArea(NULL, array($series));
		$legend = new PHPExcel_Chart_Legend(PHPExcel_Chart_Legend::POSITION_RIGHT, NULL, false);

		$chart = new PHPExcel_Chart(
					'chartG',		// name
					$title,			// title
					$legend,		// legend
					$plotArea,		// plotArea
					true,			// plotVisibleOnly
					0,				// displayBlanksAs
					NULL,			// xAxisLabel
					NULL		// yAxisLabel
				);

		if($flag=='G') {
			$chart->setTopLeftPosition('G2');
			$chart->setBottomRightPosition('N12');
		}
		else {
			$chart->setTopLeftPosition('G14');
			$chart->setBottomRightPosition('N24');
		}

		return $chart;
  	}

  	function sendGreenMsg($adEmail, $email, $oblast,$power,$angle,$square,$produc,$cost, $date,$time){
  		$adEmail .= $email;  
		$msg=" 
			<img src=http://www.artenergy.com.ua/uploads/images/ArtEnergy_logo_300x200_-_Copy.png><br>
			<table cellpadding=3>
			<tr>
			<td bgcolor=#87CEFA colspan=4><b><font face=Calibri style=font-size: 11px><center> Результаты расчета солнечной электростанции по зеленому тарифу </center></font></b></td>
			</tr>
			<tr>
			<td width=350 bgcolor=#EEE9E9><font face=Calibri style=font-size: 11px>Выбранная область</font></td>
			<td width=300 bgcolor=#EEE9E9 colspan=3><font face=Calibri style=font-size: 11px>$oblast</font></td>
			</tr>
			<tr>
			<td width=350 bgcolor=#EEE9E9><font face=Calibri style=font-size: 11px>Выбранная мощность</font></td>
			<td width=300 bgcolor=#EEE9E9 colspan=3><font face=Calibri style=font-size: 11px>$power кВт*ч</font></td>
			</tr>
			<tr>
			<td width=350 bgcolor=#EEE9E9><font face=Calibri style=font-size: 11px>Выбранный угол</font></td>
			<td width=300 bgcolor=#EEE9E9 colspan=3><font face=Calibri style=font-size: 11px>$angle °</font></td>
			</tr>
			<tr>
			<td width=350 bgcolor=#EEE9E9><font face=Calibri style=font-size: 11px>Занимаемая площадь</font></td>
			<td width=300 bgcolor=#EEE9E9 colspan=3><font face=Calibri style=font-size: 11px>$square м2</font></td>
			</tr>
			<tr>
			<td width=350 bgcolor=#EEE9E9><font face=Calibri style=font-size: 11px>Годовая выработка станции</font></td>
			<td width=300 bgcolor=#EEE9E9 colspan=3><font face=Calibri style=font-size: 11px>$produc кВт*ч</font></td>
			</tr>
			<tr>
			<td width=350 bgcolor=#EEE9E9><font face=Calibri style=font-size: 11px>Стоимость станции</font></td>
			<td width=300 bgcolor=#EEE9E9 colspan=3><font face=Calibri style=font-size: 11px>$cost  €</font></td>
			</tr>
			</table>
			"; 

		mail("$adEmail", "$date $time Результаты расчета солнечной электростанции по зеленому тарифу ", "$msg", $headers  = "Content-type: text/html; charset=UTF-8 \r\n"); 
		  
		$file = fopen("messageGreen.html", "a+"); 
			fwrite($file,"\n $date $time \n"); 
			fwrite($file, iconv('UTF-8', 'Windows-1251', $msg)); 
			fclose($file); 
	}

	function sendAutoMsg($adEmail,$email, $oblast,$power,$minTemp,$days, $equipType0,$equipAmount0,$equipType1,$equipAmount1,$equipType2,$equipAmount2,$equipType3, $date,$time){
  		$adEmail .= $email;  
		$msg=" 
			<img src=http://www.artenergy.com.ua/uploads/images/ArtEnergy_logo_300x200_-_Copy.png><br>
			<table cellpadding=3>
			<tr>
			<td bgcolor=#87CEFA colspan=4><b><font face=Calibri style=font-size: 11px><center> Результаты расчета автономной солнечной электростанции </center></font></b></td>
			</tr>
			<tr>
			<td width=350 bgcolor=#EEE9E9><font face=Calibri style=font-size: 11px>Выбранная область</font></td>
			<td width=300 bgcolor=#EEE9E9 colspan=3><font face=Calibri style=font-size: 11px>$oblast</font></td>
			</tr>
			<tr>
			<td width=350 bgcolor=#EEE9E9><font face=Calibri style=font-size: 11px>Минимальная температура в помещении</font></td>
			<td width=300 bgcolor=#EEE9E9 colspan=3><font face=Calibri style=font-size: 11px>$minTemp </font></td>
			</tr>
			<tr>
			<td width=350 bgcolor=#EEE9E9><font face=Calibri style=font-size: 11px>Дней автономной работы</font></td>
			<td width=300 bgcolor=#EEE9E9 colspan=3><font face=Calibri style=font-size: 11px>$days</font></td>
			</tr>
			<tr>
			<td width=350 bgcolor=#EEE9E9><font face=Calibri style=font-size: 11px>Общая мощность</font></td>
			<td width=300 bgcolor=#EEE9E9 colspan=3><font face=Calibri style=font-size: 11px>$power Вт&#215;ч</font></td>
			</tr>
			<tr>
			<td bgcolor=#FFD700 colspan=4><b><font face=Calibri style=font-size: 11px><center> Комплектация СЭС </center></font></b></td>
			</tr>
			<tr>
			<td width=350 bgcolor=#EEE9E9><font face=Calibri style=font-size: 11px>$equipType0</font></td>
			<td width=300 bgcolor=#EEE9E9 colspan=3><font face=Calibri style=font-size: 11px>$equipAmount0</font></td>
			</tr>
			<tr>
			<td width=350 bgcolor=#EEE9E9><font face=Calibri style=font-size: 11px>$equipType1</font></td>
			<td width=300 bgcolor=#EEE9E9 colspan=3><font face=Calibri style=font-size: 11px>$equipAmount1</font></td>
			</tr>
			<tr>
			<td width=350 bgcolor=#EEE9E9><font face=Calibri style=font-size: 11px>$equipType2</font></td>
			<td width=300 bgcolor=#EEE9E9 colspan=3><font face=Calibri style=font-size: 11px>$equipAmount2</font></td>
			</tr>
			<tr>
			<td bgcolor=#EEE9E9 colspan=4><font face=Calibri style=font-size: 11px> $equipType3 </font></td>
			</tr>
			</table>
			"; 

		mail("$adEmail", "$date $time Результаты расчета автономной солнечной электростанции ", "$msg", $headers  = "Content-type: text/html; charset=UTF-8 \r\n"); 
		  
		$file = fopen("messageAuto.html", "a+"); 
			fwrite($file,"\n $date $time \n"); 
			fwrite($file, iconv('UTF-8', 'Windows-1251', $msg)); 
			fclose($file); 
	}

	exit; 

?>