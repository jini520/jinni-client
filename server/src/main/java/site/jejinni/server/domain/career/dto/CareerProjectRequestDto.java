package site.jejinni.server.domain.career.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CareerProjectRequestDto {
	private LocalDate startDate;
	private LocalDate endDate;
	private String company;
	private String department;
	private String position;
	private String[] skills;
	private Integer orderIndex;
}

