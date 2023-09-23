const express = require('express');
const app = express();
const axios = require('axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

app.listen(8080, () => {
   // console.log('listening 8080');
})


// 해당 url에 대한 html을 가져옴
const getHTML = async () => {
   try {
      return await axios({
         method: 'GET',
         url: 'https://dhlottery.co.kr/gameResult.do?method=byWin',
         responseType: "arraybuffer",
      })
   } catch (error) {
      console.log('에러: ', error);
   }
}

getHTML().then((res) => {
   const data = iconv.decode(res.data, "EUC-KR").toString();
   const $ = cheerio.load(data);

   const $round = $(".win_result > h4 > strong"); // 회차
   const $date = $(".win_result .desc "); // 날짜
   const $lucky_num = $(".ball_645"); // 당첨번호
   const $price = $("tbody > tr > td:nth-child(4)"); // 당첨금액
   const $people = $("tbody > tr > td:nth-child(3)"); // 당첨자수

   let lotto_data = {
      '회차': '',
      '날짜': '',
      '당첨번호': [],
      '1등 당첨자수': '',
      '1등 당첨금액': '',
      '2등 당첨자수': '',
      '2등 당첨금액': '',
      '3등 당첨자수': '',
      '3등 당첨금액': '',
      '4등 당첨자수': '',
      '4등 당첨금액': '',
      '5등 당첨자수': '',
   }
   let lucky_num = [];

   $lucky_num.each((idx, val) => {
      lucky_num.push($(val).text());
   })
   $price.each((idx, val) => {
      lotto_data[`${idx+1}등 당첨금액`] = `${$(val).text()} 원`;
   })
   $people.each((idx, val) => {
      lotto_data[`${idx+1}등 당첨자수`] = `${$(val).text()} 명`;
   })

   lotto_data.회차 = $round.text();
   lotto_data.날짜 = $date.text();
   lotto_data.당첨번호 = lucky_num;
   
   console.log(lotto_data);
}).catch((error) => console.log('에러: ', error));
