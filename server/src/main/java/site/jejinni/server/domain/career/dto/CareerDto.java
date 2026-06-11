package site.jejinni.server.domain.career.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public abstract class CareerDto {
	private UUID id;
	private LocalDate startDate;
	private LocalDate endDate;
	private String company;
	private String department;
	private String position;
	private String[] skills;
}

