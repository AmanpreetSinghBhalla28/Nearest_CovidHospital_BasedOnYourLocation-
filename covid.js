require("chromedriver");
let fs = require('fs');
let wd = require("selenium-webdriver");
const puppy = require("puppeteer");
let startlocation = process.argv.splice(2);
let start = startlocation[0]+ " "+startlocation[1];
let browser = new wd.Builder().forBrowser("chrome").build();
let hospitalbed = [];
let tab;
async function wait(time){
    setTimeout(function(){
    },time);
}
 async function hospitalDetails(){
    await browser.wait(wd.until.elementLocated(wd.By.css(".vac-over50")));
    let hospitalBedOver50=await browser.findElements(wd.By.css(".vac-over50"));
    hospitalbed.push({NumberOfBedsOver50:"Over50BedsAvailable",NameofHospital:[]});
    //console.log(hospitalbed.length);
    await browser.wait(wd.until.elementLocated(wd.By.css("#beds > tbody > tr > td.show-for-medium > div")));
    let hospitalType=await browser.findElements(wd.By.css("#beds > tbody > tr > td.show-for-medium > div"));
    let t1=0;
    //console.log(hospitalType.length);
    for(let i=0; i<hospitalBedOver50.length;i++){
        hospitalbed[0].NameofHospital.push({'Name':await hospitalBedOver50[i].getAttribute("innerText"),
                                            'hospitalType':await hospitalType[t1].getAttribute("innerText"),
                                                HospitalDistance:null,TimeToReach:null,
                                            'Details':[]});
            t1=t1+1;
    }
    //console.log(hospitalbed[0].NameofHospital.length);
    await browser.wait(wd.until.elementLocated(wd.By.css("#beds > tbody > tr")));
    let h=await browser.findElements(wd.By.css("#beds > tbody > tr> td > address"));
    await browser.wait(wd.until.elementLocated(wd.By.css("#beds > tbody > tr > td > div > a")));
    let t=await browser.findElements(wd.By.css("#beds > tbody > tr > td > div > a"));
    await browser.wait(wd.until.elementLocated(wd.By.css("#beds > tbody > tr > td")));
    let vacant=await browser.findElements(wd.By.css("#beds > tbody > tr > td"));
    //console.log(vacant.length);
    let k=0; let z=1; let s=0; let v1=2;let v2 = 3;
    for(let i=0; i<hospitalbed[0].NameofHospital.length;i++){
        let num=await t[s].getAttribute("innerText");
        if(num==" Location"){
            s=s+1;
        }
        hospitalbed[0].NameofHospital[i].Details.push({HospitalAddress:await h[k].getAttribute("innerText"),
                                                        LastUpdated:await h[z].getAttribute("innerText"),
                                                        PhoneNumber:await t[s].getAttribute("innerText"),
                                                        BedsAvailable:await vacant[v2].getAttribute("innerText")+"/"+await vacant[v1].getAttribute("innerText"),
                                                       });
        k=k+2;
        z=z+2;
        s=s+1;
        v1=v1+4;
        v2=v2+4;
    }


    // await browser.wait(wd.until.elementLocated(wd.By.css(".vac-under50")));
    // let hospitalBedunder50=await browser.findElements(wd.By.css(".vac-under50"));
    // hospitalbed.push({NumberOfBedsUnder50:"under50BedsAvailable",NameofHospital:[]});
    // console.log(hospitalbed.length);
    // for(let i=0; i<hospitalBedunder50.length;i++){
    //     hospitalbed[1].NameofHospital.push({'Name':await hospitalBedunder50[i].getAttribute("innerText"),
    //                                         'hospitalType':await hospitalType[t1].getAttribute("innerText"),
    //                                         'Details':[],HospitalDistance:null,"TimeToReach":null});
    //     t1=t1+1;
    // }

    // for(let i=0; i<hospitalbed[1].NameofHospital.length;i++){
    //     let num=await t[s].getAttribute("innerText");
    //     if(num==" Location"){
    //         s=s+1;
    //     }
    //     hospitalbed[1].NameofHospital[i].Details.push({HospitalAddress:await h[k].getAttribute("innerText"),
    //                                                     LastUpdated:await h[z].getAttribute("innerText"),
    //                                                     PhoneNumber:await t[s].getAttribute("innerText"),
    //                                                     BedsAvailable:await vacant[v2].getAttribute("innerText")+"/"+await vacant[v1].getAttribute("innerText"),
    //                                                    });
    //     k=k+2;
    //     z=z+2;
    //     s=s+1;
    //     v1=v1+4;
    //     v2=v2+4;
    //}

   //console.log(h.length);
   fs.writeFileSync("covid.json",JSON.stringify(hospitalbed));  
}
async function hospitalDuration(){
    let browser = await puppy.launch({
        headless: false,
        defaultViewport: null
    });
    let tabs = await browser.pages();
    tab = tabs[0];
    //await tab.goto("https://www.google.com/maps/");
    for(let i=0;i<hospitalbed.length;i++){
        for(let j = 0; j<hospitalbed[i].NameofHospital.length;j++){
            await tab.goto("https://www.google.com/maps/");
            await tab.waitForSelector("#searchbox-directions", { visible: true });
            await tab.click("#searchbox-directions");
            await tab.waitForSelector("#sb_ifc51 > input", { visible: true });
            await tab.type("#sb_ifc51 > input",start);
            await tab.waitForSelector("#sb_ifc51 > input", { visible: true });
            await tab.type("#sb_ifc52 > input",hospitalbed[i].NameofHospital[j].Name);
            await tab.keyboard.press("Enter");
            await tab.waitForNavigation({waitUntil:'networkidle2'});
            await tab.waitForSelector("div.section-directions-trip-distance.section-directions-trip-secondary-text > div", { visible: true });
            let distance = await tab.$eval("div.section-directions-trip-distance.section-directions-trip-secondary-text > div",
                        element=> element.textContent);
            //console.log(distance);
            await tab.waitForSelector("div.section-directions-trip-numbers > div> span", { visible: true });
            let timetaken =  await tab.$eval("div.section-directions-trip-numbers > div> span",
                        element=> element.textContent);
            //console.log(timetaken);
            hospitalbed[i].NameofHospital[j].HospitalDistance=distance;
            hospitalbed[i].NameofHospital[j].TimeToReach= timetaken;
            
        }
    }
    fs.writeFileSync("covid.json",JSON.stringify(hospitalbed));
    await browser.close();
}
async function main(){
    await browser.get("https://delhifightscorona.in/");
    await browser.wait(wd.until.elementLocated(wd.By.css("#menu-item-5066")));
    await browser.findElement(wd.By.css("#menu-item-5066")).click(); 
    await hospitalDetails();
    browser.close();
    await hospitalDuration();
    
}
main();
