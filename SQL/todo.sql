CREATE TRIGGER log_registro_insert AFTER INSERT ON registrocompleto FOR EACH ROW
    Insert into registrocompleto_log (registrocompleto_log_id,accion,id_registro,valor_nuevo,tipo_movimiento_nuevo,peso_nuevo,fecha)
    VALUES (default,'Insert',NEW.registro_id,NEW.cantidad,NEW.tipodemovimiento,NEW.peso,default);

CREATE TRIGGER log_registro_update AFTER UPDATE ON registrocompleto FOR EACH ROW
    Insert into registrocompleto_log (registrocompleto_log_id,accion,id_registro,valor_nuevo,valor_viejo,tipo_movimiento_nuevo,tipo_movimiento_viejo,peso_nuevo,peso_viejo,fecha)
    VALUES (default,'Update',NEW.registro_id,NEW.cantidad,OLD.cantidad,NEW.tipodemovimiento,OLD.tipodemovimiento,NEW.peso,OLD.peso,default);

CREATE TRIGGER log_registro_delete AFTER DELETE ON registrocompleto FOR EACH ROW
    Insert into registrocompleto_log (registrocompleto_log_id,accion,id_registro,valor_viejo,tipo_movimiento_viejo,peso_viejo,fecha)
    VALUES (default,'Delete',OLD.registro_id,OLD.cantidad,OLD.tipodemovimiento,OLD.peso,default);






CREATE TRIGGER log_distribuidor_insert AFTER INSERT ON distribuidor FOR EACH ROW
    INSERT INTO distribuidor_log
    (distribuidor_log_id,distribuidor_id,accion,cedula,primer_nombre_nuevo,segundo_nombre_nuevo,primer_apellido_nuevo,
     segundo_apellido_nuevo,fecha,estado_nuevo,telefono_nuevo)
    VALUES
        (default,NEW.distribuidor_id,'Insert',NEW.cedula,NEW.primer_nombre,NEW.segundo_nombre,NEW.primer_apellido,NEW.segundo_apellido,
         default,NEW.activo,NEW.telefono);

CREATE TRIGGER log_distribuidor_update AFTER UPDATE ON distribuidor FOR EACH ROW
    INSERT INTO distribuidor_log
    (distribuidor_log_id,distribuidor_id,accion,cedula,primer_nombre_nuevo,segundo_nombre_nuevo,primer_apellido_nuevo,
     segundo_apellido_nuevo,primer_nombre_viejo,segundo_nombre_viejo,primer_apellido_viejo,
     segundo_apellido_viejo,fecha,estado_nuevo,estado_viejo,telefono_nuevo,telefono_viejo)
    VALUES
        (default,NEW.distribuidor_id,'Update',NEW.cedula,NEW.primer_nombre,NEW.segundo_nombre,NEW.primer_apellido,NEW.segundo_apellido,
         OLD.primer_nombre,OLD.segundo_nombre,OLD.primer_apellido,OLD.segundo_apellido,default,NEW.activo,OLD.activo,NEW.telefono,OLD.telefono);

CREATE TRIGGER log_distribuidor_delete AFTER DELETE ON distribuidor FOR EACH ROW
    INSERT INTO distribuidor_log
    (distribuidor_log_id,distribuidor_id,accion,cedula,primer_nombre_viejo,segundo_nombre_viejo,primer_apellido_viejo,
     segundo_apellido_viejo,fecha,estado_viejo,telefono_viejo)
    VALUES
        (default,OLD.distribuidor_id,'Delete',OLD.cedula,OLD.primer_nombre,OLD.segundo_nombre,OLD.primer_apellido,
         OLD.segundo_apellido,default,OLD.activo,OLD.telefono);







DELIMITER $$
CREATE EVENT IF NOT EXISTS meta_mensual_auto
    ON SCHEDULE EVERY 1 MONTH
        STARTS TIMESTAMP(DATE_FORMAT(DATE_ADD(CURRENT_DATE, INTERVAL 1 MONTH), '%Y-%m-01'), '00:00:00')
    DO
    BEGIN
        DECLARE latest_meta INT;
        DECLARE latest_tipo VARCHAR(45);
        SELECT
            meta,
            tipo
        INTO
            latest_meta,
            latest_tipo
        FROM
            meta
        ORDER BY
            meta_id DESC
        LIMIT
            1;
        INSERT INTO
            meta (meta, fecha_creacion, alcanzada, tipo)
        VALUES
            (latest_meta, CURRENT_TIMESTAMP, 0, latest_tipo);
    END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER meta_conseguida
    AFTER INSERT ON registrocompleto
    FOR EACH ROW
BEGIN
    IF (
        (SELECT SUM(cantidad) FROM registrocompleto WHERE tipodemovimiento = 'Venta' AND MONTH(fecha_correcta)=MONTH(NOW()))
            >=
        (SELECT meta FROM meta ORDER BY meta_id DESC LIMIT 1)
        ) THEN
        UPDATE meta
        SET alcanzada = 1
        WHERE meta_id = (
            SELECT meta_id FROM (
                                    SELECT meta_id FROM meta ORDER BY meta_id DESC LIMIT 1
                                ) AS latest_meta
        ) AND fecha_creacion;
    END IF;
END$$
DELIMITER ;
