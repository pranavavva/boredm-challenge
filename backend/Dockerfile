FROM python:3.12.2-slim

WORKDIR /app

COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5555

CMD ["hypercorn", "app:app", "--config", "hypercorn.toml"]
