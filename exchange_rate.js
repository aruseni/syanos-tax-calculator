document.addEventListener("DOMContentLoaded", function () {
    const currencyRadios = document.querySelectorAll('input[name="currency"]');
    const foreignInputDiv = document.getElementById("foreign-input");
    const sumInput = document.getElementById("sum");
    const exchangeRateInput = document.getElementById("exchange-rate");
    const resultsDiv = document.getElementById("results");

    // Створюємо поле для дати
    const dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.id = "exchange-date";
    dateInput.classList.add("date-picker"); // Додаємо клас для додаткових стилів, якщо потрібно

    // Додаємо атрибут label через обгортку
    const dateLabel = document.createElement("label");
    dateLabel.setAttribute("for", "exchange-date");
    dateLabel.textContent = "Дата курсу:";
    dateLabel.style.display = "block";
    dateLabel.style.marginBottom = "0.5rem";
    dateLabel.style.marginTop = "1rem";

    const dateWrapper = document.createElement("div");
    dateWrapper.appendChild(dateLabel);
    dateWrapper.appendChild(dateInput);

    // Встановлюємо сьогоднішню дату (20 лютого 2025) як дефолтну
    const today = new Date().toISOString().split("T")[0]; // Формат YYYY-MM-DD
    dateInput.value = today;

    // Додаємо обробник зміни дати
    dateInput.addEventListener("change", function () {
        fetchExchangeRate(dateInput.value);
    });

    // Логіка перемикання валют
    currencyRadios.forEach((radio) => {
        radio.addEventListener("change", () => {
            if (radio.value === "local_currency" && radio.checked) {
                foreignInputDiv.classList.add("hidden");
                if (dateWrapper.parentNode) dateWrapper.parentNode.removeChild(dateWrapper); // Прибираємо поле дати
                exchangeRateInput.value = ""; // Очищаємо курс
            } else if (radio.value === "foreign" && radio.checked) {
                foreignInputDiv.classList.remove("hidden");
                // Додаємо поле дати після #sum
                sumInput.parentNode.insertBefore(dateWrapper, sumInput.nextSibling);
                fetchExchangeRate(dateInput.value); // Завантажуємо курс для сьогоднішньої дати
            }
            calculate(); // Перерахунок при зміні валюти
        });
    });

    // Існуючі обробники введення
    sumInput.addEventListener("input", calculate);
    exchangeRateInput.addEventListener("input", calculate);

    // Функція для отримання курсу від НБУ
    function fetchExchangeRate(date) {
        const formattedDate = date.replace(/-/g, ""); // Перетворюємо в YYYYMMDD
        const url = `https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=USD&date=${formattedDate}&json`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    const rate = data[0].rate; // Отримуємо курс
                    exchangeRateInput.value = rate; // Підставляємо в поле
                    calculate(); // Перераховуємо податки
                } else {
                    console.error("Не вдалося отримати курс валют.");
                    exchangeRateInput.value = "";
                }
            })
            .catch(error => {
                console.error("Помилка отримання курсу валют:", error);
                exchangeRateInput.value = "";
            });
    }

    // Існуюча функція calculate() (без змін)
    function calculate() {
        resultsDiv.innerHTML = "";
        const selectedCurrency = document.querySelector('input[name="currency"]:checked').value;
        const data = getInputValues(selectedCurrency);
        if (!data) return;

        const sum = parseFloat(data.sum).toFixed(2);
        let html = "<p>Розрахунок:</p><ul>";
        if (selectedCurrency === "local_currency") {
            html += calculateTax(sum);
        } else if (selectedCurrency === "foreign") {
            const exchangeRate = parseFloat(data.exchangeRate).toFixed(4);
            const conversion = roundToTwo(sum * exchangeRate).toFixed(2);
            html += `<li>${sum} * ${exchangeRate} = ${conversion}</li>`;
            html += calculateTax(roundToTwo(conversion).toFixed(2));
        }
        html += "</ul>";
        resultsDiv.innerHTML = html;
    }

    // Існуючі допоміжні функції (roundToTwo, validateUserInput, calculateTax, getInputValues) залишаються без змін
});