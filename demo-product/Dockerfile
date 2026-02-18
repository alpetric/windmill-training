FROM python:3.11-alpine
WORKDIR /app
RUN pip install --no-cache-dir flask requests
COPY app.py index.html ./
EXPOSE 80
CMD ["python", "app.py"]
