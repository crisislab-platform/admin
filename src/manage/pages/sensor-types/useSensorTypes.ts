import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { makeFetchSensorTypes } from "../../../api";
import useAuth from "../../../auth/useAuth";
import { SensorTypes } from "../../../types";


const sensorTypesBackup: SensorTypes = {
	"Raspberry Shake 4D": ["EHZ", "ENN", "ENZ", "ENE"],
	"Raspberry Shake and Boom": ["EHZ", "HDF"],
	// Stop prettier from getting rid of brackets
	["Palert"]: ["ENN", "ENZ", "ENE"],
	["CRISiSLab Sensor"]: ["x", "y", "z"],
	"CRISiSLab Sensor V2": ["EHZ", "ENN", "ENZ", "ENE"]
};


export function useSensorTypes(): SensorTypes {
	const { user } = useAuth();
	const sensorTypesQuery = useQuery("sensor-types", makeFetchSensorTypes(user?.token));

	const data = useMemo(()=>{
		const types = {...sensorTypesBackup}

		if (!sensorTypesQuery.data) return {};

		// Overwrite the hardcoded values if we have DB values
		for (const type of sensorTypesQuery.data) {
			types[type.name] = type.channels.map(c=>c.id)
		}

		return types;
	}, [sensorTypesQuery.data])

	return data;
}