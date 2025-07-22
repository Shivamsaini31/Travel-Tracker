import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
const db=new pg.Client({
  user:"postgres",
  host:"localhost",
  database:"world",
  password:"113322",
  port:5432
});
db.connect();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function checkVisited(){
  const result=await db.query("SELECT country_code FROM visited_countries");
  let visited=[];
  // console.log(result.rows);
  if(result.rows.length!=0){
    result.rows.forEach((country)=>{
      visited.push(country.country_code);
    });
  }
  return visited;
}
app.get("/", async (req, res) => {
  let countryCode= await checkVisited();
  console.log(countryCode);
  res.render("index.ejs",{
    countries:countryCode,
    total:countryCode.length
  });
});
app.post("/add",async(req,res)=>{
  const country=req.body["country"];
  try{
    const result=await db.query(
      "SELECT country_code FROM countries WHERE country_name=$1",
      [country]
    );
    const country_code=result.rows[0].country_code;
  try{
   await db.query("INSERT INTO visited_countries (country,country_code) VALUES ($1, $2)",[country,country_code]);
   res.redirect("/");
  }
  catch(err){
    let country_code= await checkVisited();
    res.render("index.ejs",
      {
        countries:country_code,
        total:country_code.length,
        error:"Country already visited!"
      }
    );
  }
  
}
  catch(err){
    let country_code= await checkVisited();
    res.render("index.ejs",{
      countries:country_code,
      total:country.length,
      error:"Country does not Exist!"
    })
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
