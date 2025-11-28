import pandas as pd

df = pd.read_csv('src/dataset/Terremotos_final.csv')
print('Regiones únicas:')
print(sorted(df['Departamento'].unique()))
print(f'\nTotal regiones: {df["Departamento"].nunique()}')

# Check date range
df['Dia'] = pd.to_datetime(df['Dia'])
print(f'\nFecha más antigua: {df["Dia"].min()}')
print(f'Fecha más reciente: {df["Dia"].max()}')

# Check counts per region
print('\nEventos por región:')
print(df['Departamento'].value_counts().sort_index())
