from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

@app.route("/", methods=["GET", "POST"])
def survey():
    if request.method == "POST":
        # Получаем данные из формы
        question1 = request.form.get("question1")
        question2 = request.form.get("question2")
        question3 = request.form.get("question3")
        question4 = request.form.get("question4")
        question5 = request.form.get("question5")
        
        # Здесь можно сохранить данные в базу данных или файл
        
        # Перенаправляем на страницу с результатами
        return render_template("results.html", 
                               question1=question1, 
                               question2=question2, 
                               question3=question3, 
                               question4=question4, 
                               question5=question5)
    
    return render_template("survey.html")

@app.route("/results")
def results():
    return render_template("results.html")

if __name__ == "__main__":
    app.run(debug=True)
