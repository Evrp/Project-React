const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const url = "https://www.amazon.com/MSI-Codex-Gaming-Desktop-A8NUE-274US/dp/B0DGHPPL1M/ref=sr_1_5?_encoding=UTF8&content-id=amzn1.sym.860dbf94-9f09-4ada-8615-32eb5ada253a&dib=eyJ2IjoiMSJ9.h5vRULhFct9fojHaeXDbkHoAeVVlLlOXkGoAbNFIG8ca4ePUH_rDpQBR6ZAgk7ilUAGWKp-hUCL6FYgcoOAjkjybs9rHJ1H4f8-JLa6iVbiv019a-x-KevUXs0FoUN6mXDb-gTcbbFOrUOVlTC51EuUJef4XfysB0YbG9nM7hfDij-le-iv8sI9U_jziUb2TP4qOmHuh-5sRJc2RLPXOvX6ijHTRZVsi8HxS32X8tnrRrlYgs33lVNYGe_ck13gxnPGGxTDOOM9lyCUbDjM2-ca5Hk-9ndqHYR9DZN1ci-1wNt8DzOi3wGuAY8gcZnGV7RhNvVhEtjJEgbQWGIKTuAUwvFHsixu0c5HiLFMMr8yMAsLYIfVCXG0jQvWxUZL4pmGmIEon2YOAxchzli2fhoIXpujCix2SKrpa8V02a9Uo6JI27SMoUcYzEC_o-1Fr.jhTB5bVCpzTllO0e818HaPJx8N_nT35ecJaAhtkXD4g&dib_tag=se&keywords=gaming&pd_rd_r=a76153e7-addb-4ebc-b230-04fe7773432a&pd_rd_w=Yi3Vo&pd_rd_wg=wqPjz&qid=1742570688&sr=8-5&th=1";

const product = {
    name
}
const scrapeAmazon = async () => {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const title = $('.product-title-word-break').text().trim();
        const price = $('.a-price-whole').text().trim();
        const image = $('.a-dynamic-image').attr('src');
        const rating = $('.a-icon-alt').text().trim();
        const reviewCount = $('.a-size-base').text().trim();

        console.log('Title:', title);
        console.log('Price:', price);
        console.log('Image:', image);
        console.log('Rating:', rating);
        console.log('Review Count:', reviewCount);

        const data = { title, price, image, rating, reviewCount };
        fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
};