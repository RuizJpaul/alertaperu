from flask import Flask, render_template, jsonify

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/sobre-nosotros")
def sobre_nosotros():
    return render_template("sobre_nosotros.html")

@app.route("/api/pronostico/<region>")
def pronostico(region):
    from src.models.service import get_forecast
    result = get_forecast(region)
    return jsonify(result)

@app.route("/api/antecedentes/<region>")
def antecedentes(region):
    from src.models.service import get_antecedentes
    result = get_antecedentes(region)
    return jsonify(result)

