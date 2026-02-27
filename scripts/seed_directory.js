/**
 * Seed script: insert CSV data into cdma_cmsnr_drctry
 * Run: node scripts/seed_directory.js
 */

const { Sequelize } = require("sequelize");

const seq = new Sequelize("APCMMSDB_DEV", "dev_sonyp", "S0ny9_323", {
  host: "3.108.24.129",
  port: 3306,
  dialect: "mysql",
  logging: false,
});

// Convert DD/MM/YYYY → YYYY-MM-DD (MySQL DATE)
function toDate(ddmmyyyy) {
  if (!ddmmyyyy) return null;
  const [d, m, y] = ddmmyyyy.split("/");
  if (!d || !m || !y) return null;
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

// Raw CSV rows (employee_id, cfms_id, surname, firstname, dob, gender,
//              designation, department, district, status, date_of_retirement,
//              mobile_number, email)
const rows = [
  ["2607211","14410936","SHAIK","ALEEM BASHA","01/06/1966","Male","Regional Director-Cum-Appellat","Municipal Administration Department","Guntur","Working","31/05/2026","7093320018",""],
  ["0652368","14157276","NAMBUR","ANANDA KUMAR","01/09/1964","Male","Municipal Comm Gr-II","Municipal Administration Department","Palnadu","Working","31/08/2026","6300206808","mho.gunturcorporation@gmail.com"],
  ["0840044","14209829","DABBUGUNTA","BALA KRISHNA","01/01/1976","Male","Superintendent","Municipal Administration Department","Nellore","Working","31/12/2037","9985121000",""],
  ["0325916","14059925","BHIMISETTY","BALASWAMY","15/05/1967","Male","Regional Director-Cum-Appellat","Municipal Administration Department","Anantapur","Working","31/05/2029","9390876630",""],
  ["0603991","14138362","ANNAPRAGADA","BHANU PRATAP","02/05/1977","Male","Municipal Commissioner","Municipal Administration Department","Eluru","Working","31/05/2039","9701744431",""],
  ["0955740","14242864","PUSHPA RAJ","BHAVANI PRASAD","24/08/1976","Male","Municipal Comm Gr-I","Municipal Administration Department","Balaji (Tirupati)","Working","31/08/2038","9985453717",""],
  ["1151314","14305461","KOSINAPOGU","CHINNAIAH","25/12/1985","Male","Muncipal Commr Grade iii","Municipal Administration Department","Balaji (Tirupati)","Working","31/12/2047","7013915128",""],
  ["0744385","14185659","KURAPATI","DENIEL JOSEPH","23/06/1973","Male","Revenue Officer Category-Ii","Municipal Administration Department","YSR Kadapa","Working","30/06/2035","9705344826",""],
  ["0384247","14470766","H M","DHYANACHANDRA","03/03/1993","Male","Commissioner of Municipal Corporation","Municipal Administration Department","NTR (Vijayawada)","Working","31/03/2055","9145634567",""],
  ["2599787","14410476","VATAM","DIVAKAR REDDY","10/06/1982","Male","Municipal Comm Gr-II","Municipal Administration Department","Anantapur","Working","30/06/2044","9492050399","vatamdivakar@gmail.com"],
  ["0744800","14185893","SHAIK","FAZULULLA","20/08/1967","Male","Muncipal Commr Grade iii","Municipal Administration Department","Balaji (Tirupati)","Working","31/08/2029","9849904172",""],
  ["1221755","14317358","CHELLU","GANGAPRASAD","03/05/1981","Male","Muncipal Commr Grade iii","Municipal Administration Department","Nellore","Working","31/05/2043","9441435757","cganga183@gmail.com"],
  ["1048474","14266075","DASARI","HARI PRASAD","04/05/1985","Male","Sanitary Inspector","Municipal Administration Department","Kurnool","Working","31/05/2047","9885677424","dhariprasad6@gmail.com"],
  ["1048674","14266213","BADEMALKI","JABBAR MIA","01/09/1964","Male","Muncipal Commr Grade iii","Municipal Administration Department","Anantapur","Working","31/08/2026","9505750786",""],
  ["2941609","14484609","SUNDARA","JAMESVICTORRATANRAJU","06/01/1965","Male","Muncipal Commr Grade iii","Municipal Administration Department","Parvathipuram Manyam","Working","31/01/2027","7674989514","ratanraju719@gmail.com"],
  ["2942127","14485127","SYLADA","JANARDHANA RAO","31/05/1964","Male","Sanitary Superviser","Municipal Administration Department","Visakhapatnam","Working","31/05/2026","9912199283",""],
  ["0648326","14154625","MEDIKONDA","JASWANTHA RAO","03/05/1966","Male","Municipal Commissioner","Municipal Administration Department","Palnadu","Working","31/05/2028","8125422442",""],
  ["0213200","14028144","BAKURU","JSPRASADA RAJU","14/04/1984","Male","Muncipal Commr Grade iii","Municipal Administration Department","Anakapalli","Working","30/04/2046","9440404028","bjspraju@gmail.com"],
  ["2249615","14422166","PALLAPOTU","KAMALAKAR","02/08/1965","Male","Deputy Executive Engineer","Municipal Administration Department","Srikakulam","Working","31/08/2027","8555934245",""],
  ["1150335","14298841","NAMA","KANAKA RAO","27/05/1966","Male","Municipal Comm Gr-II","Municipal Administration Department","Kakinada","Leave","31/05/2028","6281735519",""],
  ["2250471","14494851","GARG","KETAN","27/11/1988","Male","Commissioner of Municipal Corporation","Municipal Administration Department","Visakhapatnam","Working","30/11/2050","7597587900",""],
  ["1242619","14401846","PULLAMPET","KISHORE","15/04/1979","Male","Municipal Comm Gr-II","Municipal Administration Department","Nandyal","Working","30/04/2041","9000745771",""],
  ["0756705","14444036","ANUSHA","KORRAPATI","26/01/1991","Female","Municipal Comm Gr-II","Municipal Administration Department","Nellore","Working","31/01/2053","9490020310",""],
  ["1069136","14860983","VADDE","KRANTHI KUMAR","20/04/1994","Male","Municipal Comm Gr-II","Municipal Administration Department","Sri Sathya Sai","Working","30/04/2056","9032501508","kumarkk140@gmail.com"],
  ["0105031","14002814","GUNDU","KRISHNA MOHAN","10/08/1965","Male","Muncipal Commr Grade iii","Municipal Administration Department","West Godavari","Working","31/08/2027","9912944571",""],
  ["0208654","14025893","THOTA","L P S S KRISHNAVENI","02/10/1970","Female","Municipal Comm Gr-II","Municipal Administration Department","East Godavari","Working","31/10/2032","7674822717","thotaveni46@gmail.com"],
  ["1060067","14274743","MALLELA","LAKSHMI DEVI","09/06/1986","Female","Assistant Comm  Municipal","Municipal Administration Department","Anantapur","Working","30/06/2048","7780238456","lakshmi.m48@gmail.com"],
  ["1242279","14401776","SIDDAVARAM","LAKSHMI NARAYANA","01/08/1968","Male","Sanitary Inspector","Municipal Administration Department","YSR Kadapa","Working","31/07/2030","9849907472",""],
  ["2703554","14473502","RAMA LAKSHMI","LALAM","10/06/1992","Female","Municipal Comm Gr-II","Municipal Administration Department","Viziaanagaram","Working","30/06/2054","8374415169","ramalakshmi2211@gmail.com"],
  ["2951718","15083873","GANJAVARAPU","LOVARAJU","15/04/1986","Male","Municipal Comm Gr-II","Municipal Administration Department","NTR (Vijayawada)","Working","30/04/2048","7799599995",""],
  ["2599713","14410463","SIMHADRI","MANOHAR","15/06/1988","Male","Municipal Commissioner (Spl. G","Municipal Administration Department","Krishna","Working","30/06/2050","9502789815","manohar1.2845@gmail.com"],
  ["7009252","15130457","NIMMANAPALLI","MANOJ REDDY","21/08/1994","Male","Regional Director-Cum-Appellat","Municipal Administration Department","YSR Kadapa","Working","31/08/2056","8328030366","manojreddy2014@gmail.com"],
  ["0943226","14235158","KUNCHALA","MANOJA","23/05/1979","Female","Muncipal Commr Grade iii","Municipal Administration Department","NTR (Vijayawada)","Working","31/05/2041","9550825823",""],
  ["0672034","14486426","NARAPUREDDY","MOURYA","22/04/1991","Female","Regional Director-Cum-Appellat","Municipal Administration Department","Balaji (Tirupati)","Working","30/04/2053","7995558444",""],
  ["1149535","14399602","CHINTA","MUNI KUMAR","29/11/1966","Male","Revenue Officer Category-Iii","Municipal Administration Department","YSR Kadapa","Working","30/11/2028","6301954918",""],
  ["0851838","14461640","Y O","NANDAN","12/06/1986","Male","Additional Commissioner (Selection Grade)","Municipal Administration Department","Nellore","Working","30/06/2048","9494075766",""],
  ["1253675","14461284","PALASANI","NARASIMHA PRASAD","15/06/1984","Male","Municipal Commissioner","Municipal Administration Department","Chitoor","Working","30/06/2046","6309727103",""],
  ["0839281","14391027","C M A","NAYEEM AHAMMED","02/02/1966","Male","Municipal Commissioner","Municipal Administration Department","Anantapur","Working","29/02/2028","9032578966",""],
  ["0732707","14388980","SHAIK","NAZEER","15/06/1979","Male","Municipal Comm Gr-I","Municipal Administration Department","Krishna","Working","30/06/2041","9966481656","nazeershaik630@gmail.com"],
  ["15155082","15155082","V","NIRMAL KUMAR","04/02/1972","Male","Municipal Comm Gr-I","Municipal Administration Department","Konaseema","Working","28/02/2034","7989143345",""],
  ["1012552","14251821","MANDI","NOOR ALI KHAN","15/06/1968","Male","Sanitary Inspector","Municipal Administration Department","Anantapur","Working","30/06/2030","9542852479",""],
  ["2703941","15028602","DONEMPUDI","PAVANI","26/02/1986","Female","Deputy Commissioner  Municipal","Municipal Administration Department","Anantapur","Working","29/02/2048","9553075917",""],
  ["2577161","14409104","KORAPATI","PEERAIAH","01/07/1977","Male","Municipal Comm Gr-II","Municipal Administration Department","Eluru","Working","30/06/2039","8309585168",""],
  ["0750653","14189971","KAMARAJUGADDA","PRAMEELA","30/07/1982","Female","Municipal Commissioner","Municipal Administration Department","Annamayya","Working","31/07/2044","9959501467","kmrag1982@gmail.com"],
  ["0944175","14393868","SHAGAPURAM","PRASAD GOUD","03/06/1974","Male","Municipal Comm Gr-II","Municipal Administration Department","Nandyal","Working","30/06/2036","8008403998",""],
  ["7009099","15128828","MEENA","RAHUL","05/01/1996","Male","Additional Director","Municipal Administration Department","East Godavari","Working","31/01/2058","7503627917","rahulmeena.5196@gmail.com"],
  ["0566953","14444160","TRIPARNA","RAM KUMAR","10/08/1988","Male","Municipal Comm Gr-I","Municipal Administration Department","West Godavari","Working","31/08/2050","9959294221",""],
  ["0651908","14387427","AKURATI","RAMA CHANDRA RAO","20/06/1968","Male","Muncipal Commr Grade iii","Municipal Administration Department","Viziaanagaram","Working","30/06/2030","6281038319",""],
  ["0652370","14157278","JASTI","RAMA RAO","15/02/1970","Male","Sanitary Superviser","Municipal Administration Department","Guntur","Working","29/02/2032","9959666935","mho.gunturcorporation@gmail.com"],
  ["2207969","14340598","JAGARAPU","RAMAAPPALANAIDU APPALANAIDU","01/07/1985","Male","Municipal Commissioner","Municipal Administration Department","Guntur","Working","30/06/2047","9100809309","harijagarapu@gmail.com"],
  ["2598372","14410396","KAMIREDDY","RAMACHANDRA REDDY","19/06/1972","Male","Municipal Commissioner","Municipal Administration Department","West Godavari","Working","30/06/2034","9848361640",""],
  ["0745067","14186084","YARRABOINA","RAMAKRISHNAIAH","04/04/1975","Male","Municipal Comm Gr-II","Municipal Administration Department","Prakasam","Working","30/04/2037","9948927362",""],
  ["0553285","14130542","AMBATI","RAMBABU","06/06/1970","Male","Muncipal Commr Grade iii","Municipal Administration Department","Eluru","Working","30/06/2032","8977111789",""],
  ["0130853","14014883","NALLI","RAMESH","01/05/1968","Male","Muncipal Commr Grade iii","Municipal Administration Department","Srikakulam","Working","30/04/2030","9177437171",""],
  ["0818948","14200935","MUPPALA","RAMESH BABU","30/07/1971","Male","Municipal Comm Gr-II","Municipal Administration Department","Guntur","Working","31/07/2033","9603444466",""],
  ["0901344","14218181","ALAGANUR VENKATA","RAMESH BABU","01/07/1966","Male","Muncipal Commr Grade iii","Municipal Administration Department","Kurnool","Leave","30/06/2028","9885398358","avrb1966@gmail.com"],
  ["0901349","14218185","LAKSHMANNAGARI","RAMESH BABU","10/07/1976","Male","Municipal Comm Gr-II","Municipal Administration Department","Nandyal","Working","31/07/2038","7702241008","lrameshbabu76@gmail.com"],
  ["1645163","14404314","GURRAM","RAVI","10/07/1966","Male","Municipal Commissioner (Spl. G","Municipal Administration Department","Annamayya","Working","31/07/2028","9121361559",""],
  ["2566637","14408518","TAMMINENI","RAVI","25/08/1975","Male","Municipal Comm Gr-II","Municipal Administration Department","Srikakulam","Working","31/08/2037","9441073977",""],
  ["0640525","14387208","GOLLAPALLI","RAVI KUMAR","21/12/1965","Male","Municipal Engineer","Municipal Administration Department","Palnadu","Working","31/12/2027","7901696231","gravikumar.dee@gmail.com"],
  ["0363890","14073187","PINNAMARAJU","RAVI VARMA","14/07/1965","Male","Muncipal Commr Grade iii","Municipal Administration Department","Konaseema","Working","31/07/2027","9491500544",""],
  ["0609484","14474488","CHINTHA","RAVICHANDRA REDDY","01/06/1967","Male","Municipal Commissioner (Spl. G","Municipal Administration Department","YSR Kadapa","Working","31/05/2029","9052229292",""],
  ["0650586","14156166","DEVARAPALLI","RAVINDRA","14/08/1966","Male","Municipal Comm Gr-II","Municipal Administration Department","Bapatla","Working","31/08/2028","9701806777",""],
  ["7009993","15135120","KAGITA","S V RAMANA SITA RAMANJANEYULU","06/07/1993","Male","Muncipal Assistant Engineer","Municipal Administration Department","Krishna","Working","31/07/2055","9701716022","kagitac22@gmail.com"],
  ["0626191","15074223","KAKARLA","SAMBA SIVA RAO","15/04/1966","Male","Municipal Comm Gr-II","Municipal Administration Department","Bapatla","Working","30/04/2028","8688322255",""],
  ["1046640","14264858","VUKKADAM","SATISH KUMAR","24/08/1972","Male","Muncipal Commr Grade iii","Municipal Administration Department","Sri Sathya Sai","Working","31/08/2034","9000031413",""],
  ["2514495","14406551","BANDI","SESHANNA","15/06/1966","Male","Municipal Commissioner (Spl. G","Municipal Administration Department","Nandyal","Working","30/06/2028","9704976053","alva1967.1966@gmail.com"],
  ["0618075","14143435","SABBI","SIVA RAMA KRISHNA","09/12/1966","Male","Municipal Commissioner (Spl. G","Municipal Administration Department","Anantapur","Working","31/12/2028","9849907595",""],
  ["2944448","14494179","KODURU","SIVA RAMA PRASAD","10/05/1967","Male","Sanitary Superviser","Municipal Administration Department","NTR (Vijayawada)","Working","31/05/2029","9030596658","ksrprasad67@gmail.com"],
  ["0139617","14465246","GANNA","SRAVANKUMAR","22/10/1980","Male","Municipal Comm Gr-I","Municipal Administration Department","Nellore","Working","31/10/2042","9949068444","sravanganna@gmail.com"],
  ["1149710","14298466","E","SREENIVASULU","01/07/1983","Male","Sanitary Inspector","Municipal Administration Department","Guntur","Working","30/06/2045","8008640525",""],
  ["1001107","14395877","PATHI","SRIHARI BABU","25/02/1968","Male","Municipal Comm Gr-I","Municipal Administration Department","Palnadu","Working","28/02/2030","8074670119","babupathi1968@gmail.com"],
  ["0566956","14443962","KUSAM","SRIKANTH REDDY","03/09/1989","Male","Municipal Comm Gr-II","Municipal Administration Department","Kakinada","Working","30/09/2051","9030500551","kusamsrikanth@gmail.com"],
  ["0818954","14200940","IRUVURI","SRINIVASULU","10/06/1970","Male","Municipal Comm Gr-II","Municipal Administration Department","Palnadu","Working","30/06/2032","9398483300","iruvuri1970@gmail.com"],
  ["0842970","14211952","VUYYALA","SRISINVASA RAO","26/08/1971","Male","Superintendent","Municipal Administration Department","Nellore","Working","31/08/2033","7032896760",""],
  ["2951683","15082549","ANISETTY","SRIVIDYA","15/11/1994","Female","Municipal Comm Gr-II","Municipal Administration Department","Kakinada","Working","30/11/2056","9542905248",""],
  ["0263331","14376033","JAMPA","SURENDRA","16/09/1965","Male","Muncipal Commr Grade iii","Municipal Administration Department","Anakapalli","Working","30/09/2027","9866172299","surendra2728@gmail.com"],
  ["0381629","14084919","PERURI","SURYA PRAKASA RAO","20/06/1994","Male","Assistant Engineer","Municipal Administration Department","Kakinada","Working","30/06/2056","7989357332","suryanani216@gmail.com"],
  ["0441922","14102307","DODDIGARLA","T VENKATA KRISHNA RAO","18/05/1964","Male","Municipal Comm Gr-II","Municipal Administration Department","NTR (Vijayawada)","Working","31/05/2026","9490349818","rajammunicipality@gmail.com"],
  ["2941607","14484607","THOMOS","TRATNAKUMAR","09/01/1964","Male","Municipal Comm Gr-II","Municipal Administration Department","Parvathipuram Manyam","Working","31/01/2026","6302026499","ratnakumartt@gmail.com"],
  ["0814458","14199349","BANDARU","UMAMAHESWARA RAO","15/06/1967","Male","Revenue Officer Category-Ii","Municipal Administration Department","Krishna","Working","30/06/2029","7799807879",""],
  ["1620444","14349674","CHODEY","VEERA VENKATA SATYA BAPIRAJU","02/04/1971","Male","Municipal Commissioner","Municipal Administration Department","Krishna","Working","30/04/2033","7386004666","chbapiraju1971@gmail.com"],
  ["0650452","14156087","DASARI","VENKATA NAGESWARA RAO","04/07/1975","Male","Sanitary Inspector","Municipal Administration Department","Nellore","Working","31/07/2037","7036053992",""],
  ["1243622","14326585","VAKAMALA","VENKATA NARASIMHA REDDY","15/05/1968","Male","Municipal Comm Gr-II","Municipal Administration Department","YSR Kadapa","Working","31/05/2030","8328439431",""],
  ["0650798","14156281","ELURU","VENKATA RAMANA BABU","23/08/1975","Male","Municipal Comm Gr-II","Municipal Administration Department","Prakasam","Working","31/08/2037","9440103891",""],
  ["1242277","14401774","NAGAM","VENKATA RAMANA REDDY","15/11/1968","Male","Muncipal Commr Grade iii","Municipal Administration Department","Chitoor","Working","30/11/2030","9133269390","apusp11@gmail.com"],
  ["0652358","14157274","TUBATI","VENKATA RANGA RAO","15/08/1965","Male","Municipal Comm Gr-II","Municipal Administration Department","Konaseema","Working","31/08/2027","9849908380","venkatarangarao.tubati@gmail.com"],
  ["0635681","14149677","APPALABHAKTULA","VENKATA RAO","04/01/1965","Male","Municipal Comm Gr-II","Municipal Administration Department","Kakinada","Working","31/01/2027","8688187269",""],
  ["0443161","14103005","VEERATHU","VENKATA RATNAM","23/07/1974","Male","Manager Category-Iii","Municipal Administration Department","NTR (Vijayawada)","Working","31/07/2036","9848788447",""],
  ["0756340","14193363","DALIPARTY","VENKATA SURYA NARAYANA RAO","01/08/1970","Male","Municipal Comm Gr-II","Municipal Administration Department","Prakasam","Working","31/07/2032","8247750045",""],
  ["0429341","14380096","KARLAPUDI","VENKATARAJA RAJESWARARAJU","11/05/1971","Male","Municipal Comm Gr-II","Municipal Administration Department","Konaseema","Working","31/05/2033","9491124465",""],
  ["1113677","14283576","KOMMINENI","VENKATARAMANA","29/06/1975","Male","Municipal Comm Gr-II","Municipal Administration Department","Eluru","Working","30/06/2037","8897603699","jayadevkommineni@gmail.com"],
  ["0946618","14237001","GURIVIREDDY GARI","VENKATARAMI REDDY","01/06/1974","Male","Muncipal Commr Grade iii","Municipal Administration Department","Balaji (Tirupati)","Working","31/05/2036","9182712708",""],
  ["0900172","14217505","KODURU","VENKATESWARA RAO","05/06/1968","Male","Municipal Commissioner","Municipal Administration Department","Prakasam","Working","30/06/2030","9866057428","nspcommissioner@gmail.com"],
  ["0517923","14119545","ANNAVARAPU","VENKATESWARLU","01/06/1964","Male","Municipal Comm Gr-I","Municipal Administration Department","Balaji (Tirupati)","Working","31/05/2026","9573549927",""],
  ["0651571","14421924","CHINTHAGUNTLA","VENKATESWARLU","01/06/1964","Male","Muncipal Commr Grade iii","Municipal Administration Department","East Godavari","Working","30/06/2026","9515291979",""],
  ["2914254","14476205","GUNTI","VENKATESWARLU","16/03/1981","Male","Muncipal Commr Grade iii","Municipal Administration Department","Palnadu","Working","31/03/2043","9959437770",""],
  ["1245309","14402197","KAMALAPURAM","VENKATRAMI REDDY","05/04/1971","Male","Muncipal Commr Grade iii","Municipal Administration Department","YSR Kadapa","Working","30/04/2033","9440797904",""],
  ["0608885","15073262","DHULIPALLA","VENU BABU","17/02/1973","Male","Municipal Comm Gr-II","Municipal Administration Department","Palnadu","Working","28/02/2035","9154039149",""],
  ["0650455","14156089","BANDELA","VIJAYA SARDHI","24/08/1968","Male","Municipal Comm Gr-I","Municipal Administration Department","West Godavari","Working","31/08/2030","9849901856",""],
  ["0608888","15073263","YARRAPATHRUNI","VLSRAO","25/07/1969","Male","Superintendent","Municipal Administration Department","Guntur","Working","31/07/2031","9347642412",""],
  ["0360596","14071175","MACHAGIRI","YESU BABU","20/05/1970","Male","Municipal Commissioner","Municipal Administration Department","West Godavari","Working","31/05/2032","9440158948",""],
];

async function seed() {
  let inserted = 0;
  let skipped  = 0;

  for (const r of rows) {
    const [employee_id, cfms_id, sir_name, first_name, dobRaw, gender,
           designation, department, district, statusRaw, dorRaw, mobile_no, email] = r;

    const dob    = toDate(dobRaw);
    const dor    = toDate(dorRaw);
    const status = statusRaw === "Leave" ? "ON LEAVE" : "ACTIVE";
    const employee_name = `${first_name} ${sir_name}`.trim();

    try {
      await seq.query(
        `INSERT INTO cdma_cmsnr_drctry
          (cfms_id, employee_id, employee_name, sir_name, first_name,
           mobile_no, dob, dor, status, gender, designation, department, district, email)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           employee_id=VALUES(employee_id),
           employee_name=VALUES(employee_name),
           sir_name=VALUES(sir_name),
           first_name=VALUES(first_name),
           mobile_no=VALUES(mobile_no),
           dob=VALUES(dob),
           dor=VALUES(dor),
           status=VALUES(status),
           gender=VALUES(gender),
           designation=VALUES(designation),
           department=VALUES(department),
           district=VALUES(district),
           email=VALUES(email)`,
        {
          replacements: [cfms_id, employee_id, employee_name, sir_name, first_name,
                         mobile_no || null, dob, dor, status, gender,
                         designation, department, district, email || null],
          type: seq.QueryTypes.INSERT,
        }
      );
      inserted++;
      process.stdout.write(`\r  Inserted/updated ${inserted} rows...`);
    } catch (err) {
      console.error(`\n  Error on cfms_id ${cfms_id}:`, err.message);
      skipped++;
    }
  }

  const [countRow] = await seq.query(
    "SELECT COUNT(*) AS total FROM cdma_cmsnr_drctry",
    { type: seq.QueryTypes.SELECT }
  );

  console.log(`\n\n✅ Done!`);
  console.log(`   Rows processed : ${rows.length}`);
  console.log(`   Inserted/updated: ${inserted}`);
  console.log(`   Errors skipped  : ${skipped}`);
  console.log(`   Total in table  : ${countRow.total}`);
}

seed()
  .then(() => seq.close())
  .catch((e) => { console.error(e); seq.close(); });
