FROM postgres:18

RUN apt-get update && apt-get install -y \
    python3-pip \
    python3-venv \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

RUN python3 -m venv /opt/patroni-venv && \
    /opt/patroni-venv/bin/pip install --upgrade pip && \
    /opt/patroni-venv/bin/pip install "patroni[etcd]" psycopg2-binary

ENV PATH="/opt/patroni-venv/bin:$PATH"

USER postgres
WORKDIR /home/postgres

COPY patroni.yml /home/postgres/patroni.yml

CMD ["patroni", "/home/postgres/patroni.yml"]