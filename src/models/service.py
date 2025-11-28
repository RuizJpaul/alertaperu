import pandas as pd
import os
from datetime import datetime, timedelta
import numpy as np
import unicodedata

DATASET_PATH = os.path.join(os.path.dirname(__file__), "../dataset/Terremotos_final.csv")

def normalize_text(text):
    """Remove accents/tildes and spaces from text for comparison"""
    if not isinstance(text, str):
        return text
    # Normalize to NFD (decomposed form) and filter out combining characters
    nfd = unicodedata.normalize('NFD', text)
    without_accents = ''.join(char for char in nfd if unicodedata.category(char) != 'Mn')
    # Remove spaces
    return without_accents.replace(' ', '').replace('-', '')

def get_forecast(region_name):
    try:
        df = pd.read_csv(DATASET_PATH)
        
        # Normalize region name for comparison (remove accents)
        region_normalized = normalize_text(region_name.upper())
        
        # Filter by region (case insensitive, accent insensitive)
        df['Departamento_normalized'] = df['Departamento'].apply(lambda x: normalize_text(str(x).upper()))
        region_df = df[df['Departamento_normalized'] == region_normalized]
        
        if region_df.empty:
            return {
                "error": f"No se encontraron datos para la región: {region_name}",
                "region": region_name
            }
            
        # Convert to datetime and sort by date ascending (oldest first)
        region_df['Dia'] = pd.to_datetime(region_df['Dia'])
        region_df = region_df.sort_values(by='Dia', ascending=True)
        
        # Get current date
        now = datetime.now()
        
        # Filter only past events (before today)
        past_events = region_df[region_df['Dia'] < now]
        
        # If we don't have enough past events, use all available data
        if len(past_events) < 2:
            # Use all events for regions with very limited data
            past_events = region_df
            if len(past_events) < 2:
                return {
                    "error": f"Datos insuficientes para {region_name}. Solo hay {len(past_events)} evento(s) registrado(s).",
                    "region": region_name
                }
        
        # Calculate time differences between consecutive events (in days)
        time_diffs = past_events['Dia'].diff().dt.total_seconds() / (24 * 3600)
        time_diffs = time_diffs.dropna()
        
        # Handle case where all events are on the same day
        if len(time_diffs) == 0 or time_diffs.sum() == 0:
            # Use a default interval of 30 days
            avg_interval_days = 30.0
            std_interval_days = 10.0
        else:
            # Calculate average interval between earthquakes
            avg_interval_days = time_diffs.mean()
            std_interval_days = time_diffs.std() if len(time_diffs) > 1 else avg_interval_days * 0.3
        
        # Get the last recorded earthquake
        last_event = past_events.iloc[-1]
        last_date = last_event['Dia']
        
        # Predict next earthquake date
        # Using average interval + some randomness based on standard deviation
        predicted_days = avg_interval_days + (std_interval_days * 0.3)
        next_earthquake_date = last_date + timedelta(days=predicted_days)
        
        # If predicted date is in the past, add intervals until we get a future date
        while next_earthquake_date < now:
            next_earthquake_date += timedelta(days=avg_interval_days)
        
        # Calculate statistics from recent events (last 10 or all if less)
        recent_count = min(10, len(past_events))
        recent_events = past_events.tail(recent_count)
        avg_magnitude = recent_events['Magnitud'].mean()
        std_magnitude = recent_events['Magnitud'].std() if len(recent_events) > 1 else 0.3
        avg_depth = recent_events['Profundidad'].mean()
        
        # Predicted magnitude with some variation
        predicted_magnitude = avg_magnitude + (std_magnitude * 0.2)
        
        # Determine risk level based on magnitude and frequency
        if avg_magnitude > 5.0 or avg_interval_days < 30:
            risk_level = "Alta"
        elif avg_magnitude > 4.0 or avg_interval_days < 60:
            risk_level = "Media"
        else:
            risk_level = "Baja"
        
        # Generate a realistic time (based on distribution of past events)
        hours = past_events['Dia'].dt.hour.mode()[0] if len(past_events['Dia'].dt.hour.mode()) > 0 else 12
        minutes = np.random.randint(0, 60)
        seconds = np.random.randint(0, 60)
        
        predicted_datetime = next_earthquake_date.replace(hour=hours, minute=minutes, second=seconds)
        
        return {
            "region": region_name,
            "fecha_estimada": predicted_datetime.strftime("%Y-%m-%d"),
            "hora_estimada": predicted_datetime.strftime("%H:%M:%S"),
            "magnitud_estimada": round(predicted_magnitude, 1),
            "profundidad_estimada": round(avg_depth, 1),
            "probabilidad": risk_level,
            "intervalo_promedio_dias": round(avg_interval_days, 1),
            "total_eventos_historicos": len(past_events),
            "ultimo_sismo_registrado": {
                "fecha": last_event['Dia'].strftime("%Y-%m-%d %H:%M:%S"),
                "magnitud": last_event['Magnitud'],
                "profundidad": last_event['Profundidad']
            }
        }
        
    except Exception as e:
        return {"error": f"Error al procesar datos: {str(e)}", "region": region_name}


def get_antecedentes(region_name, limit=20):
    """
    Get historical earthquake records for a region
    """
    try:
        df = pd.read_csv(DATASET_PATH)
        
        # Normalize region name for comparison (remove accents)
        region_normalized = normalize_text(region_name.upper())
        
        # Filter by region (case insensitive, accent insensitive)
        df['Departamento_normalized'] = df['Departamento'].apply(lambda x: normalize_text(str(x).upper()))
        region_df = df[df['Departamento_normalized'] == region_normalized]
        
        if region_df.empty:
            return {
                "error": f"No se encontraron datos para la región: {region_name}",
                "region": region_name
            }
        
        # Convert to datetime and sort by date descending (most recent first)
        region_df['Dia'] = pd.to_datetime(region_df['Dia'])
        region_df = region_df.sort_values(by='Dia', ascending=False)
        
        # Get statistics
        total_eventos = len(region_df)
        magnitud_maxima = region_df['Magnitud'].max()
        magnitud_promedio = region_df['Magnitud'].mean()
        profundidad_promedio = region_df['Profundidad'].mean()
        
        # Get most recent events
        recent_events = region_df.head(limit)
        
        # Convert to list of dictionaries
        eventos_lista = []
        for _, row in recent_events.iterrows():
            eventos_lista.append({
                "fecha": row['Dia'].strftime("%Y-%m-%d %H:%M:%S"),
                "magnitud": float(row['Magnitud']),
                "profundidad": float(row['Profundidad']),
                "latitud": float(row['Latitud']),
                "longitud": float(row['Longitud']),
                "id": row['Id']
            })
        
        # Get magnitude distribution
        mag_ranges = {
            "4.0-4.9": len(region_df[(region_df['Magnitud'] >= 4.0) & (region_df['Magnitud'] < 5.0)]),
            "5.0-5.9": len(region_df[(region_df['Magnitud'] >= 5.0) & (region_df['Magnitud'] < 6.0)]),
            "6.0+": len(region_df[region_df['Magnitud'] >= 6.0])
        }
        
        return {
            "region": region_name,
            "total_eventos": int(total_eventos),
            "magnitud_maxima": round(float(magnitud_maxima), 1),
            "magnitud_promedio": round(float(magnitud_promedio), 1),
            "profundidad_promedio": round(float(profundidad_promedio), 1),
            "distribucion_magnitudes": mag_ranges,
            "eventos_recientes": eventos_lista,
            "fecha_mas_antigua": region_df['Dia'].min().strftime("%Y-%m-%d"),
            "fecha_mas_reciente": region_df['Dia'].max().strftime("%Y-%m-%d")
        }
        
    except Exception as e:
        return {"error": f"Error al procesar datos: {str(e)}", "region": region_name}
